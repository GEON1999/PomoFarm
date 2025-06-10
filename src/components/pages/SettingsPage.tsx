import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useTranslation } from "react-i18next";
import { setLanguage } from "@/store/slices/settingsSlice";
import { resetUser } from "@/store/slices/userSlice";
import { resetFarm } from "@/store/slices/farmSlice";
import { resetTimer } from "@/store/slices/timerSlice";
import { resetShop } from "@/store/slices/shopSlice";

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.settings);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as "en" | "ko";
    dispatch(setLanguage(newLang));
  };

  const handleConfirmReset = () => {
    dispatch(resetUser());
    dispatch(resetFarm());
    dispatch(resetTimer());
    dispatch(resetShop());
    setShowResetConfirm(false);
    alert("Game data has been reset.");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("settings")}</h1>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Language Settings */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {t("language")}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">
                {t("displayLanguage")}
              </p>
              <p className="text-sm text-gray-500">{t("chooseLanguage")}</p>
            </div>
            <select
              name="language"
              value={language}
              onChange={handleLanguageChange}
              className="w-32 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="en">English</option>
              <option value="ko">한국어</option>
            </select>
          </div>
        </div>

        {/* Data Management */}
        <div className="pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {t("dataManagement", "Data Management")}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">
                {t("resetGame", "Reset Game Data")}
              </p>
              <p className="text-sm text-gray-500">
                {t("resetGameWarning", "This action cannot be undone.")}
              </p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {t("resetData", "Reset Data")}
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900">
              {t("areYouSure", "Are you sure?")}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {t(
                "resetConfirmationMessage",
                "This will reset all game data. This action cannot be undone."
              )}
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                {t("cancel", "Cancel")}
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {t("confirmReset", "Confirm Reset")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Info */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          About PomoFarm
        </h2>
        <div className="space-y-4 text-gray-600">
          <p>
            <span className="font-medium">Version:</span> 1.0.0
          </p>
          <p>
            <span className="font-medium">Developed by:</span> PomoFarm Team
          </p>
          <p>
            <span className="font-medium">Contact:</span> support@pomofarm.com
          </p>
          <div className="pt-4 border-t">
            <h3 className="font-medium text-gray-800 mb-2">Credits</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Icons by Twemoji</li>
              <li>Sounds by Zapsplat</li>
              <li>Built with React, Redux, and Tailwind CSS</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
