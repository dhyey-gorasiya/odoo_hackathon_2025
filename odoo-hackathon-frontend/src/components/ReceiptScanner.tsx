import { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { simulateOCR } from '../utils/ocr';

interface ReceiptScannerProps {
  onScan: (data: { amount?: number; date?: string; currency?: string }) => void;
  onClose: () => void;
}

export default function ReceiptScanner({ onScan, onClose }: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<{
    amount?: number;
    date?: string;
    currency?: string;
    confidence?: number;
  } | null>(null);

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    setIsScanning(true);

    try {
      const result = await simulateOCR(file);
      setScannedData({
        amount: result.amount,
        date: result.date,
        currency: result.currency,
        confidence: result.confidence,
      });
    } catch (error) {
      alert('Failed to scan receipt. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleApply = () => {
    if (scannedData) {
      onScan(scannedData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Scan Receipt</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          {!scannedData ? (
            <>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                {isScanning ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-600">Scanning receipt...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      Upload receipt image
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports JPG, PNG, PDF
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                  className="hidden"
                  accept="image/*,.pdf"
                  disabled={isScanning}
                />
              </label>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  Tip: Name your file for better OCR results
                </p>
                <p className="text-xs text-blue-700">
                  Example: receipt_125.50_USD_2024-01-15.jpg
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 mb-2">
                  Scan Complete (Confidence: {(scannedData.confidence! * 100).toFixed(0)}%)
                </p>
                <div className="space-y-2 text-sm text-green-800">
                  {scannedData.amount && (
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">{scannedData.amount}</span>
                    </div>
                  )}
                  {scannedData.currency && (
                    <div className="flex justify-between">
                      <span>Currency:</span>
                      <span className="font-medium">{scannedData.currency}</span>
                    </div>
                  )}
                  {scannedData.date && (
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">{scannedData.date}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  Please verify the extracted data before applying to your expense.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setScannedData(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Scan Again
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Apply to Expense
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
