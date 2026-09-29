import React from 'react';
import { X, HelpCircle, Gamepad2, AlertTriangle, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative text-neutral-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">賽道駕駛指南</h2>
              <p className="text-xs text-neutral-400">
                掌握米老鼠的復古極速賽車技巧
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1 text-xs leading-relaxed text-neutral-300">
          {/* Controls */}
          <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
              <Gamepad2 className="w-4 h-4 text-yellow-400" />
              <span>操作方式</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-300">
              <div className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
                <span className="font-semibold text-yellow-400 block mb-1">💻 電腦操作</span>
                <div>• 方向鍵 ◀ / ▶ 或 A / D 左右換道</div>
                <div>• 空白鍵 / Shift 鍵：釋放氮氣衝刺</div>
                <div>• P 鍵 / Esc 鍵：暫停賽局</div>
              </div>
              <div className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
                <span className="font-semibold text-yellow-400 block mb-1">📱 手機 / 平板觸控</span>
                <div>• 點擊或長按畫面左右兩側轉向</div>
                <div>• 點擊底部虛擬圓鈕 (◀ / ▶) 快速換道</div>
                <div>• 手指在賽道上左右滑動精準控車</div>
              </div>
            </div>
          </div>

          {/* Hazards */}
          <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>賽道危險警示</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="text-xl">🚚</span>
                <div>
                  <strong className="text-rose-300 block">皮特的黑色大卡車</strong>
                  龐大沉重的大型卡車，同向行駛中。正面撞擊將重創賽車並扣除 1 條生命！成功閃避可獲得 +20 分獎勵。
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-xl">🟣</span>
                <div>
                  <strong className="text-purple-300 block">路面漏油油漬</strong>
                  具有彩虹薄膜反光的危險油漬。壓過會造成車身失控旋轉打滑，並扣除 1 條生命！
                </div>
              </div>
            </div>
          </div>

          {/* Collectibles */}
          <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>獎勵道具</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="text-xl">🪙</span>
                <div>
                  <strong className="text-amber-300 block">金色米奇硬幣 (+50 分)</strong>
                  收集金幣增加總得分，並在成就獎章中累積收集數！
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-xl">⚡</span>
                <div>
                  <strong className="text-sky-300 block">氮氣加速罐 (+1 氮氣)</strong>
                  啟動後賽車獲得 4 秒極速狂飆與無敵衝撞狀態，可直接撞碎卡車並獲雙倍得分！
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-xl">❤️</span>
                <div>
                  <strong className="text-rose-300 block">維修工具愛心 (+1 命)</strong>
                  回復賽車受損機會，上限 3 條命。
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            明白了，出發！
          </button>
        </div>
      </div>
    </div>
  );
};
