import React, { useState, useEffect } from 'react';
import { X, Youtube, Image as ImageIcon, Check, Trash2, Video, Sparkles, ExternalLink, UploadCloud, RefreshCw, FileJson, Copy } from 'lucide-react';
import { KuralMedia } from '../types/kural';
import { extractYouTubeId, getYouTubeEmbedUrl } from '../utils/youtube';
import { 
  loadUserMedia, 
  exportAsKuralMediaCode, 
  exportLocalMediaAsJson, 
  importMediaFromJson, 
  UserMediaMap 
} from '../utils/storage';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKuralNumber: number;
  initialMedia?: KuralMedia;
  onSave: (kuralNumber: number, media: KuralMedia) => void;
  onDelete?: (kuralNumber: number) => void;
  onSyncComplete?: (updated: UserMediaMap) => void;
  isDark: boolean;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  initialKuralNumber,
  initialMedia,
  onSave,
  onDelete,
  onSyncComplete,
  isDark,
}) => {
  const [kuralNumber, setKuralNumber] = useState<number>(initialKuralNumber);
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [youtubeTitle, setYoutubeTitle] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageCaption, setImageCaption] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // Local storage sync states
  const [localCount, setLocalCount] = useState<number>(0);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showJsonPanel, setShowJsonPanel] = useState<boolean>(false);
  const [jsonText, setJsonText] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  useEffect(() => {
    setKuralNumber(initialKuralNumber);
    setYoutubeUrl(initialMedia?.youtubeUrl || '');
    setYoutubeTitle(initialMedia?.youtubeTitle || '');
    setImageUrl(initialMedia?.imageUrl || '');
    setImageCaption(initialMedia?.imageCaption || '');
    setNotes(initialMedia?.notes || '');
    setSyncStatus(null);

    if (isOpen) {
      const local = loadUserMedia();
      setLocalCount(Object.keys(local).length);
      setJsonText(exportLocalMediaAsJson());
    }
  }, [initialKuralNumber, initialMedia, isOpen]);

  if (!isOpen) return null;

  const youtubeId = extractYouTubeId(youtubeUrl);
  const embedUrl = getYouTubeEmbedUrl(youtubeUrl);

  // Copy drafts as lines ready to paste into KURAL_MEDIA in src/data/kuralMedia.ts
  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      await navigator.clipboard.writeText(exportAsKuralMediaCode());
      setSyncStatus(`${localCount} வரிகள் நகலெடுக்கப்பட்டன. src/data/kuralMedia.ts-இல் KURAL_MEDIA-க்குள் ஒட்டி, தளத்தை மீண்டும் வெளியிடவும் (redeploy).`);
    } catch (err: any) {
      setSyncStatus(`நகலெடுக்க இயலவில்லை: ${err?.message || 'clipboard error'}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleImportJson = () => {
    try {
      const result = importMediaFromJson(jsonText);
      setLocalCount(Object.keys(result.media).length);
      setSyncStatus(`${result.count} குறள் இணைப்புகள் வரைவாக உள்ளீடு செய்யப்பட்டன.`);
      if (onSyncComplete) {
        onSyncComplete(result.media);
      }
      setShowJsonPanel(false);
    } catch (err: any) {
      alert(`JSON உள்ளீட்டு பிழை: ${err?.message || 'Invalid JSON format'}`);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (kuralNumber < 1 || kuralNumber > 1330) return;

    onSave(kuralNumber, {
      youtubeUrl: youtubeUrl.trim() || undefined,
      youtubeTitle: youtubeTitle.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      imageCaption: imageCaption.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl p-6 sm:p-8 transition-colors ${
          isDark 
            ? 'bg-[#1E1B17] border-[#38322A] text-[#EDE8DF]' 
            : 'bg-[#FFFDF9] border-[#E5DFD3] text-[#24211D]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-2 rounded-full transition-colors cursor-pointer ${
            isDark 
              ? 'text-[#A89F91] hover:bg-[#2B2620] hover:text-white' 
              : 'text-[#7A7164] hover:bg-[#F2ECE1] hover:text-black'
          }`}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#9A3412]">
              ஊடகப் பதிவேற்றம் & இணைப்புகள்
            </span>
            <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[#1D5A43]/10 text-[#1D5A43] dark:bg-[#7FB39A]/20 dark:text-[#7FB39A] font-medium border border-[#1D5A43]/20">
              Local editor
            </span>
          </div>
          <h2 className="text-2xl font-bold font-classical mt-1">
            குறளுக்கான காணொளி & படம் சேர்த்தல்
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#A89F91]' : 'text-[#6C6356]'}`}>
            இங்கு சேர்ப்பவை இந்த உலாவியில் வரைவாக மட்டுமே சேமிக்கப்படும். அனைவருக்கும் தெரிய, "kuralMedia.ts-க்கு நகலெடு" பொத்தானை அழுத்தி src/data/kuralMedia.ts-இல் ஒட்டி, தளத்தை மீண்டும் வெளியிடவும்.
          </p>
        </div>

        {/* Local Storage Re-enter & Sync Notification */}
        <div className={`p-3.5 mb-5 rounded-xl border transition-all ${
          isDark ? 'bg-[#18261F] border-[#2A4436]' : 'bg-[#EDF5F0] border-[#CCE0D4]'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#1D5A43] dark:text-[#7FB39A] flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 shrink-0" /> 
                <span>வரைவுகள்: {localCount} குறள்கள்</span>
              </div>
              <div className={`text-[11.5px] mt-0.5 ${isDark ? 'text-[#A2BAAD]' : 'text-[#4A6355]'}`}>
                {localCount > 0
                  ? 'வரைவுகளை kuralMedia.ts-இல் ஒட்டுவதற்கு நகலெடுக்கவும்.'
                  : 'JSON மூலம் மொத்தமாக இணைப்புகளை உள்ளிட JSON காப்பு / மீட்டமை பொத்தானைப் பயன்படுத்தவும்.'}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {localCount > 0 && (
                <button
                  type="button"
                  onClick={handleSyncAll}
                  disabled={syncing}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1D5A43] hover:bg-[#164433] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'நகலெடுக்கிறது...' : `kuralMedia.ts-க்கு நகலெடு (${localCount})`}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowJsonPanel(v => !v)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                  isDark ? 'border-[#2A4436] hover:bg-white/5 text-[#A2BAAD]' : 'border-[#CCE0D4] hover:bg-white text-[#4A6355]'
                }`}
                title="JSON காப்பு & மறுஉள்ளீடு"
              >
                <FileJson className="w-4 h-4" />
                <span>{showJsonPanel ? 'மறைக்க' : 'JSON மீட்டமை / காப்பு'}</span>
              </button>
            </div>
          </div>

            {syncStatus && (
              <div className="mt-2.5 pt-2 border-t border-[#1D5A43]/20 text-xs font-medium text-[#1D5A43] dark:text-[#7FB39A]">
                {syncStatus}
              </div>
            )}

            {/* Collapsible JSON Panel for Backup / Manual Re-entry */}
            {showJsonPanel && (
              <div className="mt-3 pt-3 border-t border-[#1D5A43]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#1D5A43] dark:text-[#7FB39A]">
                    உள்ளூர் ஊடக JSON தரவு (Local Data Backup / Re-entry)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1 text-[11px] text-[#1D5A43] dark:text-[#7FB39A] hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> {copySuccess ? 'நகலெடுக்கப்பட்டது!' : 'நகலெடு (Copy)'}
                  </button>
                </div>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  rows={4}
                  className={`w-full font-mono text-[11px] p-2 rounded border focus:outline-none ${
                    isDark ? 'bg-black/40 border-[#2A4436] text-[#EEE8DC]' : 'bg-white border-[#CCE0D4] text-[#1B2621]'
                  }`}
                  placeholder='{"1": {"youtubeUrl": "https://..."}}'
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleImportJson}
                    className="px-3 py-1 rounded bg-[#1D5A43] text-white text-[11px] font-semibold hover:bg-[#164433] cursor-pointer"
                  >
                    JSON மூலம் உள்ளீடு & சேமிக்க
                  </button>
                </div>
              </div>
            )}
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kural Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium">
              குறள் எண் (1 முதல் 1330 வரை):
            </label>
            <div className="sm:col-span-2">
              <input
                type="number"
                min={1}
                max={1330}
                required
                value={kuralNumber}
                onChange={(e) => setKuralNumber(Math.max(1, Math.min(1330, parseInt(e.target.value) || 1)))}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-[#9A3412] ${
                  isDark 
                    ? 'bg-[#29241E] border-[#443C32] text-white' 
                    : 'bg-white border-[#D6CDBC] text-[#24211D]'
                }`}
              />
            </div>
          </div>

          {/* YouTube Section (9:16 Vertical Video) */}
          <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-[#25201A] border-[#3B332A]' : 'bg-[#FAF6F0] border-[#E8E1D4]'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#DC2626]">
                <Youtube className="w-4 h-4" />
                <span>யூடியூப் காணொளி (YouTube Video)</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                9:16 செங்குத்து வடிவம் (Vertical)
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                YouTube Shorts அல்லது 9:16 காணொளி இணைப்பு / Video ID:
              </label>
              <input
                type="text"
                placeholder="https://www.youtube.com/shorts/... அல்லது https://youtu.be/..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-[#9A3412] ${
                  isDark 
                    ? 'bg-[#1D1914] border-[#443C32] text-white' 
                    : 'bg-white border-[#D6CDBC] text-[#24211D]'
                }`}
              />
              <p className={`text-[11px] mt-1 ${isDark ? 'text-[#8F877B]' : 'text-[#7D7364]'}`}>
                9:16 விகிதத்திலான YouTube Shorts அல்லது செங்குத்து காணொளிகள் பரிந்துரைக்கப்படுகின்றன.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                காணொளி தலைப்பு / விளக்கம்:
              </label>
              <input
                type="text"
                placeholder="காணொளி தலைப்பு (விருப்பத்திற்கேற்ப)"
                value={youtubeTitle}
                onChange={(e) => setYoutubeTitle(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-[#9A3412] ${
                  isDark 
                    ? 'bg-[#1D1914] border-[#443C32] text-white' 
                    : 'bg-white border-[#D6CDBC] text-[#24211D]'
                }`}
              />
            </div>

            {/* YouTube 9:16 Preview */}
            {embedUrl && (
              <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10">
                <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>காணொளி அடையாளம் காணப்பட்டது:</span>
                  </div>
                  <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                    9:16 முன்னோட்டம்
                  </span>
                </div>
                <div className="flex justify-center bg-black/90 p-3 rounded-xl border border-black/20">
                  <div className="aspect-[9/16] w-[180px] sm:w-[200px] rounded-lg overflow-hidden bg-black shadow-md border border-white/10 relative">
                    <iframe
                      src={embedUrl}
                      title="YouTube 9:16 video preview"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Image Section */}
          <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-[#25201A] border-[#3B332A]' : 'bg-[#FAF6F0] border-[#E8E1D4]'}`}>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#2563EB] dark:text-[#60A5FA]">
              <ImageIcon className="w-4 h-4" />
              <span>பட இணைப்பு (Image URL)</span>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                படத்தின் நேரடி URL:
              </label>
              <input
                type="url"
                placeholder="எ.கா: https://.../image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-[#9A3412] ${
                  isDark 
                    ? 'bg-[#1D1914] border-[#443C32] text-white' 
                    : 'bg-white border-[#D6CDBC] text-[#24211D]'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                படத்திற்கான குறிப்பு (Caption):
              </label>
              <input
                type="text"
                placeholder="எ.கா: கன்னியாகுமரி திருவள்ளுவர் சிலை"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-[#9A3412] ${
                  isDark 
                    ? 'bg-[#1D1914] border-[#443C32] text-white' 
                    : 'bg-white border-[#D6CDBC] text-[#24211D]'
                }`}
              />
            </div>

            {/* Image Preview */}
            {imageUrl && (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={imageUrl}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-20 h-16 object-cover rounded-lg border"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-xs text-stone-500">பட முன்னோட்டம்</span>
              </div>
            )}
          </div>

          {/* Custom Notes */}
          <div>
            <label className="block text-xs font-medium mb-1">
              தனிப்பட்ட குறிப்புகள் அல்லது மேற்கோள் (விருப்பத்திற்குரியது):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="இக்குறளைப் பற்றிய உங்கள் சிந்தனைகள் அல்லது விளக்கக் குறிப்புகள்..."
              className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-[#9A3412] ${
                isDark 
                  ? 'bg-[#29241E] border-[#443C32] text-white' 
                  : 'bg-white border-[#D6CDBC] text-[#24211D]'
              }`}
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-between gap-3 border-t border-[#E5DFD3] dark:border-[#38322A]">
            {initialMedia && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(kuralNumber);
                  onClose();
                }}
                className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 py-2 px-3 rounded-lg border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ஊடகத்தை நீக்குக</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  isDark 
                    ? 'border-[#443C32] text-[#C4B9A7] hover:bg-[#29241E]' 
                    : 'border-[#D9CFBE] text-[#554C40] hover:bg-[#F2ECE1]'
                }`}
              >
                ரத்து செய்க
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#9A3412] hover:bg-[#832B0E] text-white shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>சேமிக்க</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
