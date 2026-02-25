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
    // 1. Önce veritabanında bugünün sayfası var mı kontrol et, yoksa tertemiz sayfa aç
    this.prayerService.initializeTodayIfEmpty().then(() => {
      // 2. Ardından Firebase'den gelen anlık verileri dinlemeye başla
      this.prayerService.getTodayProgress().subscribe((data) => {
        if (data) {
          // Aslı veya sen tıkladığında bu kod anında diğer telefonun ekranını güncelleyecek
          this.asli = data.asli || this.asli;
          this.hasanCan = data.hasanCan || this.hasanCan;
        }
      });
    });
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
    // Tıklandığı an gecikme hissi olmaması için önce ekranda rengi değiştiriyoruz
    const currentValue = user === 'asli' ? this.asli[prayerName] : this.hasanCan[prayerName];
    const newValue = !currentValue;

    // Ardından Firebase'e fırlatıyoruz!
    this.prayerService.updatePrayer(user, prayerName, newValue);
  }
}
