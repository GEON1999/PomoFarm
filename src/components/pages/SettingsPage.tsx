import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateSettings } from '@/store/slices/userSlice';

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.user);
  const [currentSettings, setCurrentSettings] = useState(settings);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setCurrentSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  // Handle toggle changes
  const handleToggleChange = (name: string) => {
    setCurrentSettings(prev => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev]
    }));
  };

  // Save settings
  const handleSave = () => {
    dispatch(updateSettings(currentSettings));
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Reset to defaults
  const handleReset = () => {
    setCurrentSettings(settings);
    setShowResetConfirm(false);
  };

  // Export game data
  const handleExport = () => {
    const data = {
      user: useAppSelector(state => state.user),
      farm: useAppSelector(state => state.farm),
      timer: useAppSelector(state => state.timer),
      shop: useAppSelector(state => state.shop),
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportName = `pomofarm-save-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  };

  // Import game data
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        // In a real app, we would dispatch actions to update the store with the imported data
        console.log('Imported data:', data);
        alert('Game data imported successfully!');
      } catch (error) {
        console.error('Error parsing save file:', error);
        alert('Error importing game data. The file may be corrupted.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    e.target.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
      
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">Game Settings</h2>
        
        <div className="space-y-6">
          {/* Sound Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Sound</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Enable Sound</p>
                  <p className="text-sm text-gray-500">Toggle all sound effects</p>
                </div>
                <button
                  onClick={() => handleToggleChange('soundEnabled')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    currentSettings.soundEnabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      currentSettings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Background Music</p>
                  <p className="text-sm text-gray-500">Toggle background music</p>
                </div>
                <button
                  onClick={() => handleToggleChange('musicEnabled')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    currentSettings.musicEnabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      currentSettings.musicEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Sound Volume</p>
                  <p className="text-sm text-gray-500">Adjust sound effects volume</p>
                </div>
                <input
                  type="range"
                  name="soundVolume"
                  min="0"
                  max="1"
                  step="0.1"
                  value={currentSettings.soundVolume}
                  onChange={handleInputChange}
                  className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Music Volume</p>
                  <p className="text-sm text-gray-500">Adjust background music volume</p>
                </div>
                <input
                  type="range"
                  name="musicVolume"
                  min="0"
                  max="1"
                  step="0.1"
                  value={currentSettings.musicVolume}
                  onChange={handleInputChange}
                  className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
          
          {/* Notification Settings */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Enable Notifications</p>
                  <p className="text-sm text-gray-500">Receive browser notifications</p>
                </div>
                <button
                  onClick={() => handleToggleChange('notificationsEnabled')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    currentSettings.notificationsEnabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      currentSettings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Timer Completion Alerts</p>
                  <p className="text-sm text-gray-500">Notify when timer completes</p>
                </div>
                <button
                  onClick={() => handleToggleChange('timerAlertsEnabled')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    currentSettings.timerAlertsEnabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      currentSettings.timerAlertsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
          
          {/* Timer Settings */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Timer Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="focusDuration" className="block text-sm font-medium text-gray-700 mb-1">
                  Focus Duration (minutes)
                </label>
                <input
                  type="number"
                  id="focusDuration"
                  name="focusDuration"
                  min="1"
                  max="60"
                  value={currentSettings.focusDuration / 60}
                  onChange={(e) => {
                    const value = Math.min(60, Math.max(1, parseInt(e.target.value) || 25));
                    setCurrentSettings(prev => ({
                      ...prev,
                      focusDuration: value * 60
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="shortBreakDuration" className="block text-sm font-medium text-gray-700 mb-1">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  id="shortBreakDuration"
                  name="shortBreakDuration"
                  min="1"
                  max="30"
                  value={currentSettings.shortBreakDuration / 60}
                  onChange={(e) => {
                    const value = Math.min(30, Math.max(1, parseInt(e.target.value) || 5));
                    setCurrentSettings(prev => ({
                      ...prev,
                      shortBreakDuration: value * 60
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="longBreakDuration" className="block text-sm font-medium text-gray-700 mb-1">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  id="longBreakDuration"
                  name="longBreakDuration"
                  min="1"
                  max="60"
                  value={currentSettings.longBreakDuration / 60}
                  onChange={(e) => {
                    const value = Math.min(60, Math.max(1, parseInt(e.target.value) || 15));
                    setCurrentSettings(prev => ({
                      ...prev,
                      longBreakDuration: value * 60
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
          
          {/* Save & Reset Buttons */}
          <div className="pt-6 border-t flex justify-between">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reset to Defaults
            </button>
            
            <div className="space-x-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Save Changes
              </button>
            </div>
          </div>
          
          {/* Save Success Message */}
          {showSaveSuccess && (
            <div className="fixed bottom-6 right-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Settings saved successfully!
            </div>
          )}
          
          {/* Reset Confirmation Dialog */}
          {showResetConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reset Settings</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to reset all settings to their default values? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                  >
                    Reset Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Data Management */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">Data Management</h2>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">Export Game Data</h3>
              <p className="text-sm text-gray-500 mt-1">Download a backup of your game data</p>
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Export Data
            </button>
          </div>
          
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">Import Game Data</h3>
              <p className="text-sm text-gray-500 mt-1">Restore from a previously saved backup</p>
            </div>
            <div>
              <input
                type="file"
                id="import-file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <label
                htmlFor="import-file"
                className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 inline-block"
              >
                Import Data
              </label>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium text-gray-800 mb-2">Reset Game Progress</h3>
            <p className="text-sm text-gray-600 mb-4">
              Warning: This will permanently delete all your game data and cannot be undone.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all game progress? This cannot be undone.')) {
                  // In a real app, we would dispatch an action to reset all game state
                  alert('Game progress has been reset.');
                }
              }}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reset Game
            </button>
          </div>
        </div>
      </div>
      
      {/* App Info */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">About PomoFarm</h2>
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
