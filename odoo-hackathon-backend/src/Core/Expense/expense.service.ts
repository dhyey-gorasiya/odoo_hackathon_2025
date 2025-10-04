import { Injectable, Logger } from '@nestjs/common';
import fb from '../../firebase/firebase';
import { CreateExpenseDto } from './expense.dto';

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name);
  private db = fb.getFirestore();

  async createExpense(dto: CreateExpenseDto) {
    try {
      const expenseRef = this.db.collection('expenses').doc();
      const data = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await expenseRef.set(data);
      return { id: expenseRef.id, ...data };
    } catch (error) {
      this.logger.error(`Error creating expense: ${error.message}`);
      throw error;
    }
  }

  async getExpenseById(id: string) {
    const doc = await this.db.collection('expenses').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  }

  async getAllExpenses(companyId: string) {
    const snapshot = await this.db
      .collection('expenses')
      .where('companyId', '==', companyId)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async updateExpense(id: string, updates: Partial<CreateExpenseDto>) {
    const expenseRef = this.db.collection('expenses').doc(id);
    await expenseRef.update({
      ...updates,
      updatedAt: new Date(),
    });
    return { id, ...updates };
  }

  async deleteExpense(id: string) {
    await this.db.collection('expenses').doc(id).delete();
    return { success: true, id };
  }
}
