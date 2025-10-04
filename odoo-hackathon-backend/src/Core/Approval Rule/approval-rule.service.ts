import { Injectable, Logger } from '@nestjs/common';
import { CreateApprovalRuleDto } from './approval-rule.dto';
import fb from '../../firebase/firebase';


@Injectable()
export class ApprovalRuleService {
  private readonly logger = new Logger(ApprovalRuleService.name);
  private db = fb.getFirestore();

  async createRule(dto: CreateApprovalRuleDto) {
    try {
      const ruleRef = this.db.collection('approvalRules').doc();
      const data = {
        ...dto,
        createdAt: new Date(),
      };
      await ruleRef.set(data);
      return { id: ruleRef.id, ...data };
    } catch (error) {
      this.logger.error(`Error creating approval rule: ${error.message}`);
      throw error;
    }
  }

  async getRuleById(id: string) {
    const doc = await this.db.collection('approvalRules').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getRulesByCompany(companyId: string) {
    const snapshot = await this.db
      .collection('approvalRules')
      .where('companyId', '==', companyId)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async updateRule(id: string, updates: Partial<CreateApprovalRuleDto>) {
    const ruleRef = this.db.collection('approvalRules').doc(id);
    await ruleRef.update({
      ...updates,
      updatedAt: new Date(),
    });
    return { id, ...updates };
  }

  async deleteRule(id: string) {
    await this.db.collection('approvalRules').doc(id).delete();
    return { success: true, id };
  }
}
