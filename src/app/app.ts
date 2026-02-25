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
  lastSevenDays: any[] = [];
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
    this.prayerService.initializeTodayIfEmpty().then(() => {
      this.prayerService.getTodayProgress().subscribe((data) => {
        if (data) {
          this.asli = data.asli || this.asli;
          this.hasanCan = data.hasanCan || this.hasanCan;
        }
      });
    });

    this.calculateStreak();
  }

  getScore(progress: { [key: string]: boolean }): number {
    return Object.values(progress).filter((completed) => completed).length;
  }

  getCircleProgress(progress: { [key: string]: boolean }): string {
    const score = this.getScore(progress);
    const percentage = score / 5;
    const filledPart = percentage * 226;
    return `${filledPart} 226`;
  }

  togglePrayer(user: 'asli' | 'hasanCan', prayerName: string) {
    const currentValue = user === 'asli' ? this.asli[prayerName] : this.hasanCan[prayerName];
    const newValue = !currentValue;
    this.prayerService.updatePrayer(user, prayerName, newValue);
  }

  async calculateStreak() {
    const history = await this.prayerService.getRecentHistory(7);
    const dates = Object.keys(history).sort().reverse();

    let count = 0;
    for (const date of dates) {
      const dayData = history[date];
      const asliScore = Object.values(dayData.asli || {}).filter((v) => v).length;
      const hasanScore = Object.values(dayData.hasanCan || {}).filter((v) => v).length;

      if (asliScore === 5 && hasanScore === 5) {
        count++;
      } else {
        break; // Seri bozulduysa dur
      }
    }
    this.streakCount = count;
  }
}
