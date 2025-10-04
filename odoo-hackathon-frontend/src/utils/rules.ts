import type { ApprovalRule, ApprovalStep } from '../types';

export interface RuleEvaluationResult {
  approved: boolean;
  explanation: string;
  progress?: {
    current: number;
    required: number;
    percentage: number;
  };
}

export function evaluateApprovalRule(
  rule: ApprovalRule,
  approverActions: ApprovalStep[]
): RuleEvaluationResult {
  const totalApprovers = rule.approvalSequence.length;
  const approvedCount = approverActions.filter(a => a.status === 'approved').length;
  const rejectedCount = approverActions.filter(a => a.status === 'rejected').length;

  if (rejectedCount > 0) {
    return {
      approved: false,
      explanation: 'Expense rejected by one or more approvers',
    };
  }

  if (totalApprovers === 0) {
    return {
      approved: false,
      explanation: 'No approvers configured',
    };
  }

  if (rule.type === 'specific' && rule.specificApproverIds?.length) {
    const specificApproved = approverActions.some(
      action =>
        action.status === 'approved' &&
        rule.specificApproverIds?.includes(action.approverId)
    );

    if (specificApproved) {
      return {
        approved: true,
        explanation: 'Approved by specific authorized approver',
      };
    }

    return {
      approved: false,
      explanation: `Waiting for approval from specific approver(s)`,
    };
  }

  if (rule.type === 'percentage' && rule.percentageThreshold !== undefined) {
    const requiredApprovals = Math.ceil(totalApprovers * (rule.percentageThreshold / 100));
    const percentage = totalApprovers > 0 ? (approvedCount / totalApprovers) * 100 : 0;

    if (approvedCount >= requiredApprovals) {
      return {
        approved: true,
        explanation: `Reached ${rule.percentageThreshold}% approval threshold (${approvedCount}/${totalApprovers})`,
        progress: {
          current: approvedCount,
          required: requiredApprovals,
          percentage,
        },
      };
    }

    return {
      approved: false,
      explanation: `${approvedCount}/${requiredApprovals} approvals received (${percentage.toFixed(0)}%)`,
      progress: {
        current: approvedCount,
        required: requiredApprovals,
        percentage,
      },
    };
  }

  if (rule.type === 'hybrid') {
    if (rule.specificApproverIds?.length) {
      const specificApproved = approverActions.some(
        action =>
          action.status === 'approved' &&
          rule.specificApproverIds?.includes(action.approverId)
      );

      if (specificApproved) {
        return {
          approved: true,
          explanation: 'Approved by specific authorized approver (hybrid rule)',
        };
      }
    }

    if (rule.percentageThreshold !== undefined) {
      const requiredApprovals = Math.ceil(totalApprovers * (rule.percentageThreshold / 100));
      const percentage = totalApprovers > 0 ? (approvedCount / totalApprovers) * 100 : 0;

      if (approvedCount >= requiredApprovals) {
        return {
          approved: true,
          explanation: `Reached ${rule.percentageThreshold}% approval threshold (${approvedCount}/${totalApprovers})`,
          progress: {
            current: approvedCount,
            required: requiredApprovals,
            percentage,
          },
        };
      }

      return {
        approved: false,
        explanation: `${approvedCount}/${requiredApprovals} approvals received (${percentage.toFixed(0)}%) or waiting for specific approver`,
        progress: {
          current: approvedCount,
          required: requiredApprovals,
          percentage,
        },
      };
    }
  }

  if (approvedCount === totalApprovers) {
    return {
      approved: true,
      explanation: 'All approvers approved',
    };
  }

  return {
    approved: false,
    explanation: `${approvedCount}/${totalApprovers} approvers approved`,
  };
}
