import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { ApprovalStep } from '../types';

interface ApprovalTimelineProps {
  timeline: ApprovalStep[];
  currentIndex: number;
}

export default function ApprovalTimeline({ timeline, currentIndex }: ApprovalTimelineProps) {
  return (
    <div className="space-y-4">
      {timeline.map((step, index) => {
        const isActive = index === currentIndex;
        const isPast = index < currentIndex;

        return (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.status === 'approved'
                    ? 'bg-green-100 text-green-600'
                    : step.status === 'rejected'
                    ? 'bg-red-100 text-red-600'
                    : isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.status === 'approved' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : step.status === 'rejected' ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
              {index < timeline.length - 1 && (
                <div
                  className={`w-0.5 h-16 ${
                    isPast || step.status === 'approved'
                      ? 'bg-green-300'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>

            <div className="flex-1 pb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {step.approverName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {step.status === 'approved'
                        ? 'Approved'
                        : step.status === 'rejected'
                        ? 'Rejected'
                        : isActive
                        ? 'Pending Review'
                        : 'Waiting'}
                    </p>
                  </div>
                  {step.timestamp && (
                    <span className="text-xs text-gray-500">
                      {new Date(step.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>

                {step.comment && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">{step.comment}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
