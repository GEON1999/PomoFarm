import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { plantCrop, waterPlot, harvestPlot, addAnimal, feedAnimal, collectProduct, FarmPlot, Animal } from '@/store/slices/farmSlice';
import { spendDiamonds } from '@/store/slices/userSlice';
import { formatDistanceToNow } from 'date-fns';

const FarmPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { plots, animals, inventory } = useAppSelector((state) => state.farm);
  const { diamonds } = useAppSelector((state) => state.user);
  
  const [selectedTab, setSelectedTab] = useState<'farm' | 'animals' | 'inventory'>('farm');
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [showSeedMenu, setShowSeedMenu] = useState<string | null>(null);
  
  // Available seeds from inventory
  const availableSeeds = inventory.filter(item => item.type === 'crop');
  
  // Handle plot click
  const handlePlotClick = (plot: FarmPlot) => {
    if (plot.cropId) {
      if (plot.growthProgress >= 100) {
        // Harvest if ready
        dispatch(harvestPlot(plot.id));
      } else if (!plot.isWatered) {
        // Water if not watered
        dispatch(waterPlot(plot.id));
      }
    } else {
      // Show seed selection if empty
      setShowSeedMenu(plot.id);
    }
  };
  
  // Handle seed selection
  const handleSeedSelect = (plotId: string, seedId: string) => {
    dispatch(plantCrop({ plotId, cropId: seedId }));
    setShowSeedMenu(null);
  };
  
  // Handle animal feeding
  const handleFeedAnimal = (animalId: string) => {
    // Check if we have crops to feed
    const hasCrops = inventory.some(item => item.type === 'crop' && item.quantity > 0);
    
    if (hasCrops) {
      // In a real app, we'd deduct the crop from inventory
      dispatch(feedAnimal(animalId));
    } else {
      // Show message or notification about needing crops
      alert('You need crops to feed your animals!');
    }
  };
  
  // Handle collecting animal products
  const handleCollectProduct = (animalId: string) => {
    dispatch(collectProduct(animalId));
  };
  
  // Buy a new animal
  const handleBuyAnimal = (animalType: string, price: number) => {
    if (diamonds >= price) {
      dispatch(spendDiamonds(price));
      dispatch(addAnimal({ type: animalType }));
    } else {
      alert('Not enough diamonds!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Farm</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedTab('farm')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedTab === 'farm' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Farm
          </button>
          <button
            onClick={() => setSelectedTab('animals')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedTab === 'animals' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Animals ({animals.length})
          </button>
          <button
            onClick={() => setSelectedTab('inventory')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedTab === 'inventory' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Inventory
          </button>
        </div>
      </div>
      
      {selectedTab === 'farm' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {plots.map((plot) => (
              <div 
                key={plot.id} 
                className={`aspect-square rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${
                  plot.cropId 
                    ? plot.growthProgress >= 100 
                      ? 'border-yellow-400 bg-yellow-50' 
                      : plot.isWatered 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => handlePlotClick(plot)}
              >
                {plot.cropId ? (
                  <div className="text-center">
                    <div className="text-4xl mb-1">
                      {plot.growthProgress >= 100 ? '🌱' : '🌱'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {plot.growthProgress >= 100 
                        ? 'Ready to harvest!' 
                        : `${Math.round(plot.growthProgress)}%`}
                    </div>
                    {plot.isWatered && (
                      <div className="text-blue-500 text-xs mt-1">💧 Watered</div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-300 text-2xl">+</div>
                )}
                
                {/* Seed Selection Menu */}
                {showSeedMenu === plot.id && (
                  <div className="absolute z-10 mt-40 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
                    <div className="text-xs text-gray-500 mb-2 px-2">Select Seed:</div>
                    {availableSeeds.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSeeds.map((seed) => (
                          <div
                            key={seed.id}
                            className="p-2 hover:bg-gray-100 rounded cursor-pointer text-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeedSelect(plot.id, seed.itemId);
                            }}
                          >
                            <div className="text-xl">🌱</div>
                            <div className="text-xs">{seed.itemId}</div>
                            <div className="text-xs text-gray-500">x{seed.quantity}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 p-2">No seeds in inventory</div>
                    )}
                    <button 
                      className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSeedMenu(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-medium text-yellow-800 mb-2">Farm Tips</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Click on an empty plot to plant a seed</li>
              <li>• Water your plants to help them grow faster</li>
              <li>• Harvest crops when they're fully grown</li>
              <li>• Use crops to feed your animals</li>
            </ul>
          </div>
        </div>
      )}
      
      {selectedTab === 'animals' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Animal List */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Animals</h2>
              {animals.length > 0 ? (
                <div className="space-y-4">
                  {animals.map((animal) => (
                    <div key={animal.id} className="border rounded-lg p-4 flex items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mr-4">
                        {animal.type === 'chicken' ? '🐔' : '🐄'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 capitalize">
                          {animal.type}
                          {animal.productReady && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                              Ready!
                            </span>
                          )}
                        </h3>
                        <div className="text-sm text-gray-600 mb-2">
                          Happiness: {Math.round(animal.happiness)}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${animal.happiness}%` }}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleFeedAnimal(animal.id)}
                            className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                          >
                            Feed
                          </button>
                          {animal.productReady && (
                            <button
                              onClick={() => handleCollectProduct(animal.id)}
                              className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full hover:bg-yellow-200 transition-colors"
                            >
                              Collect
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-5xl mb-2">🐾</div>
                  <p className="mb-4">You don't have any animals yet!</p>
                  <p className="text-sm">Visit the shop to buy animals.</p>
                </div>
              )}
            </div>
            
            {/* Buy Animals */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Buy Animals</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mr-4">
                      🐔
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Chicken</h3>
                      <p className="text-sm text-gray-600">Lays eggs every 2 hours</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuyAnimal('chicken', 100)}
                    className="w-full bg-green-100 text-green-800 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center justify-center"
                  >
                    <span className="text-yellow-500 mr-1">💎</span> 100
                  </button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mr-4">
                      🐄
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Cow</h3>
                      <p className="text-sm text-gray-600">Produces milk every 4 hours</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuyAnimal('cow', 250)}
                    className="w-full bg-green-100 text-green-800 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center justify-center"
                  >
                    <span className="text-yellow-500 mr-1">💎</span> 250
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {selectedTab === 'inventory' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Inventory</h2>
          
          {inventory.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {inventory.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-2">
                    {item.type === 'crop' ? '🌱' : item.type === 'animal' ? '🐔' : '🥚'}
                  </div>
                  <div className="font-medium text-gray-800 capitalize">
                    {item.itemId.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-gray-600">x{item.quantity}</div>
                  <button className="mt-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded hover:bg-gray-200 transition-colors">
                    Use
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-4">📦</div>
              <p>Your inventory is empty</p>
              <p className="text-sm mt-2">Grow crops and collect products to fill it up!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FarmPage;
