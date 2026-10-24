# Ödevio

React + TypeScript + Vite ile hazırlanmış, yalnızca frontend içeren öğrenci çalışma defteri. Gerçekçi açılan kapak, kareli sayfalar, beş renk teması, öğrenci ve öğretmen yerleşimleri içerir.

## Başlatma

Node.js 22 veya üzeri gerekir.

```bash
npm ci
npm run dev
```

Terminalin gösterdiği yerel adresi aç. İlk ekranda defter kapağı görünür; kapağa tıklayarak rol seçimine geçilir. Hesap olmadan “Öğrenci ekranlarını incele” veya “Öğretmen ekranlarını incele” bağlantılarıyla bütün boş ekranlar gezilebilir.

```bash
npm run build
npm run preview
npm test
```

`dist/` dağıtıma hazır statik çıktıdır. Uygulama sunucu kodu, veritabanı, sunucu fonksiyonu veya kimlik doğrulama uygulaması içermez. Üretim paketinde harici font veya görsel isteği yoktur.

## Bu aşamada veri davranışı

- Bütün koleksiyonlar `[]`, profiller ve oturum `null` başlar. Hiçbir örnek hesap, kod, ödev, yanlış, deneme, plan, not veya gönderilmiş mesaj yoktur.
- İstatistikler sıfırdır; ilerleme çubuğu boştur. Takvim ve saat gerçek cihaz tarih/saatini gösterir.
- Ders kataloğu da boş başlar; ders seçenekleri ileride `subjectService` tarafından sağlanır. Katalog olmadan ders gerektiren kayıt tamamlanamaz; form yine açılıp incelenebilir.
- Avatar, tema, hafta günleri, çalışma yöntemleri ve hazır geri bildirim seçenekleri arayüz tanımlarıdır; kullanıcı kaydı veya demo veri değildir.
- Formlar ve tema yalnızca React belleğinde yaşar. Sayfa yenilenince veya form kapatılınca kaydedilmemiş girişler kaybolur.
- Cihaz kalıcı depolaması, çerez yazan frontend kodu, service worker veya çevrimdışı veri önbelleği bulunmaz.
- Bağlantısız servislerde okuma işlemleri boş veri döndürür. Yazma, silme, hesap oluşturma ve gönderim işlemleri `ApiError('UNAVAILABLE')` ile sonuçlanır. Başarılıymış gibi kayıt yapılmaz.
- Başarı durumu yalnızca servisten gerçek başarılı yanıt gelirse gösterilir. Hata durumunda formun girdileri korunur.

## Sayfalar

Hash tabanlı rotalar GitHub Pages alt klasörlerinde ve sayfa yenilemede çalışır.

| Yol                      | Ekran                                                      |
| ------------------------ | ---------------------------------------------------------- |
| `#/`                     | Açılan defter kapağı                                       |
| `#/giris`                | Öğrenci / öğretmen seçimi                                  |
| `#/giris/ogrenci`        | Yeni hesap / mevcut hesap                                  |
| `#/kayit`                | İsim, sınıf, okul, avatar ve ders seçimi                   |
| `#/giris/ogrenci/kod`    | Altı haneli öğrenci koduyla giriş                          |
| `#/giris/ogretmen`       | Öğretmen giriş formu                                       |
| `#/ogrenci`              | Takvim, saat, mesajlar, ödev özeti ve günlük çalışma       |
| `#/ogrenci/odevler`      | Ders filtreleri, ödev ekleme                               |
| `#/ogrenci/odevler/:id`  | Gerçek ödev ayrıntısı, düzenleme ve değerlendirme          |
| `#/ogrenci/yanlislar`    | Güncel / geçmiş, çalışma yöntemi etiketleri                |
| `#/ogrenci/hedefler`     | Hedefler, ekstra çalışmalar, bugünün ve geçmişin sonuçları |
| `#/ogrenci/denemeler`    | Deneme formu, sonuçlar, son üç ayın gerçek veri grafikleri |
| `#/ogrenci/plan`         | Pazartesi–Pazar planı, tarih değiştirerek taşıma           |
| `#/ogrenci/notlar`       | Özel not ekleme, düzenleme, silme, sabitleme, arama        |
| `#/ogrenci/ayarlar`      | Tema, profil, dersler, kod, çıkış, hesap silme             |
| `#/ogretmen`             | Öğrenci listesi ve kodla bağlama                           |
| `#/ogretmen/ogrenci`     | Hesapsız boş öğrenci ayrıntı görünümü                      |
| `#/ogretmen/ogrenci/:id` | Bağlı öğrencinin çalışma özeti ve hazır geri bildirim      |
| `#/ogretmen/ayarlar`     | Öğretmen profili, tema ve hesap işlemleri                  |

Ödev tamamlama yalnızca gerçek bir ödev seçilince açılır: bilinmeyen bir kimlik için sahte ayrıntı oluşturulmaz. Düzenleme ve silme kontrolleri de gerçek kayıtlar olduğunda görünür.

## Dizin yapısı

```text
src/
  components/   Ortak UI, erişilebilir pencereler, alanlar, özetler, grafikler
  pages/        Öğrenci, öğretmen, giriş ve kayıt sayfaları
  layouts/      Role göre ayrı menüler ve defter yerleşimi
  state/        React bellek durumu, oturum, async sorgular ve yenileme
  models/       TypeScript modelleri ve sabit UI seçenekleri
  services/     API yapılandırması, istemci ve 11 servis grubu
  theme/        Tema sağlayıcı, beş palet ve responsive stil sistemi
  animations/   Kapak açılışı, sayfa geçişi, azaltılmış hareket
  validation/   Kod, soru toplamı, yanlış konuları, hedef ve net kuralları
```

## GitHub Pages

1. Bu klasörün içeriğini kendi GitHub deposuna yükle ve ana dalını `main` olarak kullan.
2. Depoda **Settings → Pages → Build and deployment → Source → GitHub Actions** seç.
3. `main` dalına gönderim yap veya **Actions → GitHub Pages yayını → Run workflow** çalıştır.
4. İş akışı derler ve yalnızca `dist/` içeriğini yayınlar.

`vite.config.ts` içinde `base: './'` vardır. Rotalar `HashRouter` kullanır; ek 404 sunucu kuralı gerekmez. API kapalı olarak yayınlanır. Gelecekte `VITE_API_ENABLED`, `VITE_API_BASE_URL` ve `VITE_NET_PENALTY` değerlerini GitHub Repository Variables altında tanımlayabilirsin. `VITE_` değişkenleri herkese açık frontend ayarlarıdır; sır veya özel anahtar koyma.

## Tasarım ve erişim

- Tema düğmeleri oturum boyunca çalışır; aynı tasarım beş palete uygulanır.
- Ana sayfadaki ödev kutusunun yüksekliği breakpoint'e göre sabittir; `min-height:0`, `overflow-y:auto`, `overflow-x:hidden` ve `overscroll-behavior-y:contain` yalnızca iç listeye uygulanır. Üst başlık sabit kalır. Satırlar 56 px, açıklama tek satır ve üç noktalıdır.
- Liste boşken de kutunun yüksekliği değişmez. Mobilde kutular alt alta gelir. Tüm sayfa, diğer bölümler için normal biçimde kayabilir; ödev sayısı sayfa yüksekliğini artırmaz.
- Native `dialog` pencereleri klavye odağını içeride tutar, Escape ile kapanır ve odağı açan düğmeye döndürür.
- Bütün form alanları gerçek `label` öğelerine bağlıdır. İkon düğmelerinin erişilebilir adları vardır. Seçili durumlar sadece renkle anlatılmaz.
- `prefers-reduced-motion` ve görünür klavye odağı desteklenir.
- Planı taşımak için öğeyi açıp gününü değiştir; sürükle-bırak gerektirmeyen bu yöntem mobil ve klavyeyle de çalışır.
- Grafikler yalnızca gerçek sonuçlar varsa çizilir; aynı dersin son üç ayda en az iki sonucu gerekir. Grafik verileri ayrıca erişilebilir tablo olarak açılabilir.

## Doğrulama

TypeScript üretim derlemesi ve `npm test` içindeki sözleşme testleri çalıştırılmıştır. Testler soru toplamlarını, zorunlu yanlış konularını, hedef seçimini, hesaplamayı, boş servisleri, yazma reddini ve özel not ayrımını denetler. Otomatik tarayıcı/görsel test yapılmamıştır.

Backend entegrasyonu ve endpoint sözleşmeleri için [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md).
