import React, { useState } from "react";
import {
  IconChevronRight,
  IconFileUpload,
  IconProgress,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../../context/index";
import ReactMarkdown from "react-markdown";
import FileUploadModal from "./components/file-upload-modal";
import RecordDetailsHeader from "./components/record-details-header";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

function extractJsonFromMarkdown(markdownText) {
  const match = markdownText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return match ? match[1].trim() : markdownText.trim();
}

function SingleRecordDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(
    state.analysisResult || ""
  );
  const [filename, setFilename] = useState("");
  const [filetype, setFileType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { updateRecord } = useStateContext();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileType(file.type);
    setFilename(file.name);
    setFile(file);
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async () => {
    setUploading(true);
    setUploadSuccess(false);

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    try {
      const base64Data = await readFileAsBase64(file);

      const imageParts = [
        {
          inlineData: {
            data: base64Data,
            mimeType: filetype,
          },
        },
      ];

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `Anda adalah seorang ahli dalam menganalisis diagnosis penyakit kanker dan hanya kanker tidak dengan penyakit lain. Berdasarkan laporan medis yang saya unggah, berikan rencana pengobatan yang rinci dan dipersonalisasi.

      Buat rencana tersebut dalam paragraf-paragraf agar mudah dibaca dan dipahami oleh pasien awam. Gunakan bahasa yang jelas, tidak terlalu teknis, dan susun secara sistematis sesuai tahapan pengobatan.`;


      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();
      setAnalysisResult(text);
      await updateRecord({
        documentID: state.id,
        analysisResult: text,
        kanbanRecords: "",
      });
      setUploadSuccess(true);
      setIsModalOpen(false);
      setFilename("");
      setFile(null);
      setFileType("");
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  const processTreatmentPlan = async () => {
    setIsProcessing(true);

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Peran Anda adalah membuat daftar tugas berbasis rencana pengobatan berikut: ${analysisResult}

Buat dalam format kolom seperti berikut:
- Todo: Tugas yang harus dimulai
- Doing: Tugas yang sedang dikerjakan
- Done: Tugas yang sudah selesai

Setiap tugas harus memiliki deskripsi singkat. Kategorikan tugas ke kolom yang sesuai berdasarkan tahap pengobatan. Hasilnya harus ditampilkan dalam struktur JSON berikut (tanpa tanda kutip atau penjelasan tambahan):

{
  "columns": [
    { "id": "todo", "title": "Todo" },
    { "id": "doing", "title": "Sedang Dikerjakan" },
    { "id": "done", "title": "Selesai" }
  ],
  "tasks": [
    { "id": "1", "columnId": "todo", "content": "Contoh tugas 1" },
    { "id": "2", "columnId": "todo", "content": "Contoh tugas 2" },
    { "id": "3", "columnId": "doing", "content": "Contoh tugas 3" },
    { "id": "4", "columnId": "doing", "content": "Contoh tugas 4" },
    { "id": "5", "columnId": "done", "content": "Contoh tugas 5" }
  ]
}`;



    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = extractJsonFromMarkdown(text);
    const parsedResponse = JSON.parse(cleanedText);

    await updateRecord({
      documentID: state.id,
      kanbanRecords: text,
    });
    navigate("/screening-schedules", { state: parsedResponse });
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-wrap gap-[26px]">
      <button
        type="button"
        onClick={handleOpenModal}
        className="mt-6 inline-flex items-center gap-x-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-[#13131a] dark:text-white dark:hover:bg-neutral-800"
      >
        <IconFileUpload />
        Upload Medical Check Up
      </button>

      <FileUploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onFileChange={handleFileChange}
        onFileUpload={handleFileUpload}
        uploading={uploading}
        uploadSuccess={uploadSuccess}
        filename={filename}
      />

      <RecordDetailsHeader recordName={state.recordName} />

      <div className="w-full">
        <div className="flex flex-col">
          <div className="-m-1.5 overflow-x-auto">
            <div className="inline-block min-w-full p-1.5 align-middle">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-[#13131a]">
                <div className="border-b border-gray-200 px-6 py-4 dark:border-neutral-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200">
                    AI-Based Personalized Treatment Strategy
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    A medical solution tailored to individual conditions with the support of artificial intelligence.
                  </p>
                </div>
                <div className="flex w-full flex-col px-6 py-4 text-white">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Analysis Result
                    </h2>
                    <div className="space-y-2">
                      <ReactMarkdown>{analysisResult}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-2 sm:flex">
                    <button
                      type="button"
                      onClick={processTreatmentPlan}
                      className="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                    >
                      View Treatment plan
                      <IconChevronRight size={20} />
                      {processing && (
                        <IconProgress
                          size={10}
                          className="mr-3 h-5 w-5 animate-spin"
                        />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 border-t border-gray-200 px-6 py-4 md:flex md:items-center md:justify-between dark:border-neutral-700">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                      <span className="font-semibold text-gray-800 dark:text-neutral-200"></span>{" "}
                    </p>
                  </div>
                  <div>
                    <div className="inline-flex gap-x-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleRecordDetails;
