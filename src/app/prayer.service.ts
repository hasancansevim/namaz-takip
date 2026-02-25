import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  getDocs,
  limit,
  orderBy,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface DailyProgress {
  asli: { [key: string]: boolean };
  hasanCan: { [key: string]: boolean };
}

@Injectable({
  providedIn: 'root',
})
export class PrayerService {
  private firestore = inject(Firestore);

  // Otomatik gün atlama mantığımız: Bugünün tarihini YYYY-MM-DD formatında alıyoruz
  getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Veritabanındaki anlık değişiklikleri dinleyen fonksiyon
  getTodayProgress(): Observable<DailyProgress | undefined> {
    const todayStr = this.getTodayDateString();
    const docRef = doc(this.firestore, `prayers/${todayStr}`);
    return docData(docRef) as Observable<DailyProgress | undefined>;
  }

  // Siteye ilk girildiğinde o günün kaydı yoksa sıfırdan oluşturur
  async initializeTodayIfEmpty() {
    const todayStr = this.getTodayDateString();
    const docRef = doc(this.firestore, `prayers/${todayStr}`);

    // Önce veritabanında bugünün kaydı var mı diye bakıyoruz
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Eğer bugün için hiç kayıt yoksa (ilk defa giriliyorsa) boş şablonu oluştur
      const defaultData: DailyProgress = {
        asli: { Sabah: false, Öğle: false, İkindi: false, Akşam: false, Yatsı: false },
        hasanCan: { Sabah: false, Öğle: false, İkindi: false, Akşam: false, Yatsı: false },
      };
      await setDoc(docRef, defaultData);
    }
  }

  // Butona tıklandığında veritabanını güncelleyen fonksiyon
  async updatePrayer(user: 'asli' | 'hasanCan', prayerName: string, value: boolean) {
    const todayStr = this.getTodayDateString();
    const docRef = doc(this.firestore, `prayers/${todayStr}`);

    await updateDoc(docRef, {
      [`${user}.${prayerName}`]: value,
    });
  }

  async getRecentHistory(days: number = 7) {
    const prayersCol = collection(this.firestore, 'prayers');
    // Tarihe göre sıralayıp son 'days' kadar kaydı getiriyoruz
    const q = query(prayersCol, orderBy('__name__', 'desc'), limit(days));
    const querySnapshot = await getDocs(q);

    const history: { [date: string]: any } = {};
    querySnapshot.forEach((doc) => {
      history[doc.id] = doc.data();
    });
    return history;
  }
}
