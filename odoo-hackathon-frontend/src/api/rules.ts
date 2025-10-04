import { v4 as uuidv4 } from 'uuid';
import type { ApprovalRule, RuleType } from '../types';
import { getRulesCookie, setRulesCookie } from '../utils/cookieStore';

export interface CreateRuleDTO {
  name: string;
  companyId: string;
  type: RuleType;
  percentageThreshold?: number;
  specificApproverIds?: string[];
  approvalSequence: string[];
}

export async function createRule(dto: CreateRuleDTO): Promise<ApprovalRule> {
  const rules = getRulesCookie();

  const rule: ApprovalRule = {
    id: uuidv4(),
    name: dto.name,
    companyId: dto.companyId,
    type: dto.type,
    percentageThreshold: dto.percentageThreshold,
    specificApproverIds: dto.specificApproverIds,
    approvalSequence: dto.approvalSequence,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  rules.push(rule);
  setRulesCookie(rules);

  return rule;
}

export async function updateRule(id: string, updates: Partial<ApprovalRule>): Promise<ApprovalRule> {
  const rules = getRulesCookie();
  const index = rules.findIndex(r => r.id === id);

  if (index === -1) {
    throw new Error('Rule not found');
  }

  rules[index] = { ...rules[index], ...updates };
  setRulesCookie(rules);

  return rules[index];
}

export async function listRules(companyId?: string): Promise<ApprovalRule[]> {
  const rules = getRulesCookie();

  if (companyId) {
    return rules.filter(r => r.companyId === companyId);
  }

  return rules;
}

export async function getRule(id: string): Promise<ApprovalRule | null> {
  const rules = getRulesCookie();
  return rules.find(r => r.id === id) || null;
}

export async function deleteRule(id: string): Promise<void> {
  const rules = getRulesCookie();
  const filtered = rules.filter(r => r.id !== id);
  setRulesCookie(filtered);
}

export async function getActiveRule(companyId: string): Promise<ApprovalRule | null> {
  const rules = getRulesCookie();
  return rules.find(r => r.companyId === companyId && r.isActive) || null;
}
