import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { pullGacha } from '@/store/slices/shopSlice';
import { buyItem } from '@/store/slices/farmSlice';
import { showNotification } from '@/store/slices/notificationSlice';

const ShopPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const diamonds = useAppSelector(state => state.user.diamonds);
  const inventory = useAppSelector(state => state.user.inventory);

  // crop/animal_product 가챠 자원 계산
  const cropCount = inventory.filter(item => item.type === 'crop').reduce((sum, item) => sum + item.quantity, 0);
  const animalProductCount = inventory.filter(item => item.type === 'animal_product').reduce((sum, item) => sum + item.quantity, 0);
  const [tab, setTab] = useState<'plant' | 'animal' | 'crop' | 'animal_product'>('plant');
  const [isPulling, setIsPulling] = useState(false);
  const [gachaResult, setGachaResult] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);

  // 가챠 실행 핸들러
  const handleGacha = async (type: 'single' | 'multi') => {
    setIsPulling(true);
    try {
      // 실제 가챠 pull
      // unwrap() 대신 thunk 결과를 직접 await (thunk는 createAsyncThunk가 아님)
      const results = await dispatch<any>(pullGacha(tab, type));
      setGachaResult(results);
      setShowResult(true);
      // 뽑은 아이템을 농장 인벤토리/동물에 반영
      results.forEach((item: any) => {
        dispatch(buyItem({ itemId: item.id, quantity: 1 }));
      });
      dispatch(showNotification({ message: `You got ${results.length} item(s)!`, type: 'success' }));
    } catch (e: any) {
      dispatch(showNotification({ message: e.message || 'Not enough diamonds!', type: 'error' }));
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Shop Gacha</h1>
      <div className="mb-4 flex gap-4">
        <button onClick={() => setTab('plant')} className={`px-4 py-2 rounded-md font-semibold ${tab === 'plant' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>Plant Gacha</button>
        <button onClick={() => setTab('animal')} className={`px-4 py-2 rounded-md font-semibold ${tab === 'animal' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Animal Gacha</button>
        <button onClick={() => setTab('crop')} className={`px-4 py-2 rounded-md font-semibold ${tab === 'crop' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>Crop Gacha</button>
        <button onClick={() => setTab('animal_product')} className={`px-4 py-2 rounded-md font-semibold ${tab === 'animal_product' ? 'bg-yellow-700 text-white' : 'bg-gray-200'}`}>Animal Product Gacha</button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
        {tab === 'crop' ? (
          <div className="mb-4 text-lg font-semibold">Crops: <span className="text-orange-500">{cropCount}</span></div>
        ) : tab === 'animal_product' ? (
          <div className="mb-4 text-lg font-semibold">Animal Products: <span className="text-yellow-700">{animalProductCount}</span></div>
        ) : (
          <div className="mb-4 text-lg font-semibold">Diamonds: <span className="text-blue-500">{diamonds}</span></div>
        )}
        <div className="flex gap-4 mb-4">
          {tab === 'crop' ? (
            <>
              <button disabled={isPulling || cropCount < 5} onClick={() => handleGacha('single')} className="px-6 py-2 bg-orange-500 text-white rounded-md font-bold hover:bg-orange-600 disabled:bg-gray-300">Single Pull (5 Crops)</button>
              <button disabled={isPulling || cropCount < 50} onClick={() => handleGacha('multi')} className="px-6 py-2 bg-orange-600 text-white rounded-md font-bold hover:bg-orange-700 disabled:bg-gray-300">10 Pulls (50 Crops)</button>
            </>
          ) : tab === 'animal_product' ? (
            <>
              <button disabled={isPulling || animalProductCount < 3} onClick={() => handleGacha('single')} className="px-6 py-2 bg-yellow-700 text-white rounded-md font-bold hover:bg-yellow-800 disabled:bg-gray-300">Single Pull (3 Animal Products)</button>
              <button disabled={isPulling || animalProductCount < 30} onClick={() => handleGacha('multi')} className="px-6 py-2 bg-yellow-800 text-white rounded-md font-bold hover:bg-yellow-900 disabled:bg-gray-300">10 Pulls (30 Animal Products)</button>
            </>
          ) : (
            <>
              <button disabled={isPulling || diamonds < 100} onClick={() => handleGacha('single')} className="px-6 py-2 bg-purple-500 text-white rounded-md font-bold hover:bg-purple-600 disabled:bg-gray-300">Single Pull (100💎)</button>
              <button disabled={isPulling || diamonds < 900} onClick={() => handleGacha('multi')} className="px-6 py-2 bg-yellow-500 text-white rounded-md font-bold hover:bg-yellow-600 disabled:bg-gray-300">10 Pulls (900💎)</button>
            </>
          )}
        </div>
        <div className="text-sm text-gray-500 mb-2">
          {tab === 'plant' && 'Get random seeds with various rarity!'}
          {tab === 'animal' && 'Get random animals with various rarity!'}
          {tab === 'crop' && 'Use crops to pull random rewards! (5 crops per pull)'}
          {tab === 'animal_product' && 'Use animal products to pull random rewards! (3 animal products per pull)'}
        </div>
      </div>
      {/* 결과 모달 */}
      {showResult && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <h2 className="text-xl font-bold mb-4 text-center">Gacha Result</h2>
            {tab === 'crop' && cropCount < 5 && (
          <div className="text-red-500 mb-2 text-center">Not enough crops for gacha.</div>
        )}
        {tab === 'animal_product' && animalProductCount < 3 && (
          <div className="text-red-500 mb-2 text-center">Not enough animal products for gacha.</div>
        )}
        <div className="grid grid-cols-2 gap-3 mb-4">
              {gachaResult.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center p-2 border rounded-md bg-gray-50">
                  <div className="text-3xl mb-1">{item.emoji || '🎁'}</div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.rarity?.toUpperCase() || ''}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowResult(false)} className="block mx-auto px-4 py-2 bg-green-500 text-white rounded-md font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
