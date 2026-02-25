import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrayerService } from './prayer.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  private prayerService = inject(PrayerService);

  streakCount: number = 0;
  daysOfWeek = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  historyData: any = {};
  todayIndex: number = 0; // Bugünün hangi günde olduğunu burada tutacağız

  prayers = [
    { name: 'Sabah', icon: '🌅' },
    { name: 'Öğle', icon: '☀️' },
    { name: 'İkindi', icon: '🌤️' },
    { name: 'Akşam', icon: '🌇' },
    { name: 'Yatsı', icon: '🌙' },
  ];

  asli: { [key: string]: boolean } = {
    Sabah: false,
    Öğle: false,
    İkindi: false,
    Akşam: false,
    Yatsı: false,
  };
  hasanCan: { [key: string]: boolean } = {
    Sabah: false,
    Öğle: false,
    İkindi: false,
    Akşam: false,
    Yatsı: false,
  };

  ngOnInit() {
    // Bugünün index'ini hesapla (Pzt: 0, Paz: 6)
    const now = new Date();
    this.todayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;

    this.prayerService.initializeTodayIfEmpty().then(() => {
      this.prayerService.getTodayProgress().subscribe((data) => {
        if (data) {
          this.asli = data.asli || this.asli;
          this.hasanCan = data.hasanCan || this.hasanCan;
          // Her güncellemede seriyi tekrar hesapla
          this.calculateStreak();
        }
      });
    });
  }

  getScore(progress: { [key: string]: boolean }): number {
    return Object.values(progress).filter((completed) => completed).length;
  }

  getCircleProgress(progress: { [key: string]: boolean }): string {
    const score = this.getScore(progress);
    const filledPart = (score / 5) * 226;
    return `${filledPart} 226`;
  }

  togglePrayer(user: 'asli' | 'hasanCan', prayerName: string) {
    const currentValue = user === 'asli' ? this.asli[prayerName] : this.hasanCan[prayerName];
    this.prayerService.updatePrayer(user, prayerName, !currentValue);
  }

  async calculateStreak() {
    this.historyData = await this.prayerService.getRecentHistory(7);
    const dates = Object.keys(this.historyData).sort().reverse();

    let count = 0;
    for (const date of dates) {
      const dayData = this.historyData[date];
      // Skor hesaplarken tipleri garantiye alıyoruz
      const asliScore = Object.values(dayData.asli || {}).filter((v) => v === true).length;
      const hasanScore = Object.values(dayData.hasanCan || {}).filter((v) => v === true).length;

      if (asliScore === 5 && hasanScore === 5) {
        count++;
      } else {
        // Eğer kontrol edilen gün "bugün" ise ve henüz tamamlanmadıysa seriyi bozma
        const todayStr = new Date().toISOString().split('T')[0];
        if (date === todayStr) continue;
        break;
      }
    }
    this.streakCount = count;
  }

  getDayStatus(dayIndex: number): 'completed' | 'partial' | 'empty' {
    if (dayIndex > this.todayIndex) return 'empty';

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (this.todayIndex - dayIndex));
    const dateStr = targetDate.toISOString().split('T')[0];

    const dayData = this.historyData[dateStr];
    if (!dayData) return 'empty';

    const asliScore = Object.values(dayData.asli || {}).filter((v) => v === true).length;
    const hasanScore = Object.values(dayData.hasanCan || {}).filter((v) => v === true).length;

    if (asliScore === 5 && hasanScore === 5) return 'completed';
    if (asliScore > 0 || hasanScore > 0) return 'partial';
    return 'empty';
  }
}
