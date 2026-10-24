# Ödevio — Backend bağlantı rehberi

Bu projede backend yoktur. Aşağıdaki uç noktalar gelecekte bağlanacak servisin **önerilen sözleşmesidir**; oluşturulmuş veya çalışır bir sunucu değildir.

## Bağlantıyı açma

`.env.example` dosyasını `.env.local` olarak kopyala. `VITE_API_ENABLED=true` ve gerçek API temel adresiyle `VITE_API_BASE_URL` değerini tanımla, ardından yeniden derle. Adresler `src/services/config.ts`, ortak istek davranışı `src/services/client.ts` içinde yönetilir. Bileşenlerde endpoint adresi yoktur.

API'n bu sözleşmeden farklıysa yalnızca ilgili `src/services/*Service.ts` dosyalarında URL / payload / response eşlemesini değiştir. Sayfalar TypeScript modelleriyle çalışır. Liste yanıtı doğrudan dizi; nesne yanıtı doğrudan model olmalıdır. API bir `{ data: ... }` zarfı veya sayfalama kullanıyorsa bunu servis katmanında çöz.

Tüm kimlikler string, öğrenci kodu baştaki sıfırları koruyan tam altı haneli string, tarih alanları `YYYY-MM-DD`, zaman damgaları ISO 8601 olmalıdır. Gösterim Türkçedir. Plan ve çalışma günleri öğrencinin yerel takvim gününü ifade eder; backend aynı zaman dilimi sözleşmesini izlemelidir. Para alanı yoktur; soru sayıları negatif olmayan tam sayıdır. Net ve toplam puan ondalıklı olabilir.

## Servisler ve beklenen veri

Tablodaki yollar yapılandırılmış temel API adresine göredir. Bütün nesne tipleri `src/models/index.ts` içindedir.

| Servis               | İşlem / uç nokta                                 | İstek ve yanıt                                                                                    |
| -------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| authService          | GET `/auth/session`                              | `Session` veya `null`; `role`, `userId`                                                           |
| authService          | POST `/auth/students`                            | İsim, avatar kimliği, sınıf, okul, subjectIds → `Session`; öğrenci kodunu yalnızca backend üretir |
| authService          | POST `/auth/student-login`                       | `{ studentCode }` → `Session`                                                                     |
| authService          | POST `/auth/teacher-login`                       | `{ email, password }` → `Session`                                                                 |
| authService          | POST `/auth/logout`                              | 204                                                                                               |
| authService          | DELETE `/auth/account`                           | Hesabın silinmesi → 204                                                                           |
| studentService       | GET / PATCH `/students/me`                       | `StudentProfile` / düzenlenebilir profil alanları; id ve kod değiştirilemez                       |
| studentService       | GET `/students/me/summary?date=...`              | `DailySummary`: totalQuestions, correct, wrong, target, completedHomework                         |
| teacherService       | GET / PATCH `/teachers/me`                       | `TeacherProfile` / isim, e-posta, branş                                                           |
| teacherService       | GET `/teachers/me/students`                      | `TeacherStudentLink[]`; her bağlantıda öğrenci id, isim, sınıf, avatar özeti                      |
| teacherService       | POST `/teachers/me/students`                     | `{ studentCode }` → `TeacherStudentLink`                                                          |
| teacherService       | GET `/teachers/me/students/:id`                  | `TeacherStudentOverview` veya `null`; özel not verisi yok                                         |
| subjectService       | GET `/subjects`                                  | Hesap açma / ayarlar için gerçek `Subject[]` kataloğu                                             |
| subjectService       | GET / PATCH `/students/me/subjects`              | Seçili `Subject[]` / `{ subjectIds }`                                                             |
| homeworkService      | GET / POST `/homework`                           | `Homework[]` / id, studentId, status hariç ödev alanları → `Homework`                             |
| homeworkService      | GET / PATCH `/homework/:id`                      | `Homework` veya `null` / düzenlenebilir ödev alanları                                             |
| homeworkService      | POST `/homework/:id/completion`                  | `{ correct, wrong, wrongTopics }` → `HomeworkCompletion`                                          |
| wrongNotebookService | GET `/wrong-entries?view=current` veya `history` | `WrongEntry[]`; tarih/arşiv ayrımı backend tarafından yapılır                                     |
| wrongNotebookService | PATCH `/wrong-entries/:id/study`                 | `{ studied, studyMethods }` → `WrongEntry`                                                        |
| goalService          | GET / POST `/goals`                              | `DailyGoal[]` / id, studentId hariç hedef alanları                                                |
| goalService          | PATCH `/goals/:id`                               | Hedef alanları → `DailyGoal`                                                                      |
| goalService          | GET `/practice-results?date=...`                 | `DailyPracticeResult[]`; date verilmezse geçmiş dahil tüm sonuçlar                                |
| goalService          | POST `/practice-results`                         | id, studentId hariç çalışma sonucu → `DailyPracticeResult`                                        |
| mockExamService      | GET / POST `/mock-exams`                         | `MockExam[]` / id, studentId hariç deneme alanları                                                |
| weeklyPlanService    | GET `/weekly-plan?weekStart=...`                 | Pazartesi başlayan haftanın `WeeklyPlanItem[]` kayıtları                                          |
| weeklyPlanService    | POST / PATCH `/weekly-plan[/id]`                 | Plan alanları → `WeeklyPlanItem`; plannedDate, dueDate'den bağımsızdır                            |
| weeklyPlanService    | DELETE `/weekly-plan/:id`                        | Yalnızca plan öğesi → 204                                                                         |
| noteService          | GET / POST `/private-notes`                      | Yalnızca sahibi için `PrivateNote[]` / title, content, subjectId, pinned                          |
| noteService          | PATCH / DELETE `/private-notes/:id`              | Güncellenmiş `PrivateNote` / 204                                                                  |
| messageService       | GET `/messages`                                  | Oturumdaki öğrenciye gönderilmiş `TeacherMessage[]`                                               |
| messageService       | POST `/messages`                                 | `{ studentId, preset }` → `TeacherMessage`; serbest metin kabul edilmez                           |

## Doğrulama ve sunucunun sorumlulukları

Frontend doğrulamaları kullanım içindir; aynı kurallar backend'de de uygulanmalıdır.

- Altı haneli kodun benzersizliği, gerçek kullanıcı kimliği ve oturum tamamen backend'e aittir. Frontend kod üretmez. Kodla girişin gerçek kimlik doğrulama politikası ileride sunucu tarafından belirlenir.
- İsteklerden sahiplik kimliği alınmaz. `studentId`, `teacherId`, kayıt id'si ve zaman damgaları oturumdan / sunucudan gelir. Öğretmen seçtiği öğrenciye yalnızca bağlantısı varsa erişebilir.
- Ödev tamamlamada `correct + wrong === totalQuestions`; yanlış varsa dolu konu adları ve pozitif tam sayı konu adetleri zorunludur. Konu adetleri yanlış toplamına eşittir. Ödevde boş sorular desteklenmez.
- Tamamlama, `Homework.status` güncellemesi ve yanlış kayıtlarının oluşturulması sunucuda tek atomik işlem olmalıdır. Tekrar gönderim aynı yanlışları çoğaltmamalıdır.
- Günlük hedef, ekstra çalışma ve deneme sonucu kaydetme işlemleri de yanlış defterine sunucuda aktarım yapmalıdır. Kaynaklar `homework`, `goal`, `extra`, `mock-exam`; sonuncusu UI'da “Deneme yanlışı”dır.
- `WrongEntry` kayıtları bir takvim ayı sonra yalnızca güncel görünümden çıkarılır; silinmez. Sınır tarihi, artık gün ve zaman dilimi politikası backend'e aittir. `archivedAt` ve `view` buna göre dönmelidir.
- Çalışma yöntemi kodları: `questions`, `video`, `topic`, `teacher`, `review`. Birden çok seçilebilir; hepsi kaldırılırsa `studied=false` olur.
- Hedef örüntüleri: `once {date}`, `daily {startDate}`, `weekdays {startDate,days}` (1=Pazartesi…7=Pazar), `alternating {startDate,subjectIds}`. Dönüşümlü listede ilk ders başlangıç tarihinde, diğerleri sonraki günlerde sırayla çalışılır ve döngü tekrarlar. En az iki farklı ders gerekir. Günlük özetin hedef toplamını backend bu kurallara ve `active` durumuna göre hesaplar.
- Günlük özet; ödev tamamlama ve çalışma kayıtlarını tekrarsız biçimde birleştirmeli, doğru/yanlış/soru sayıları aynı kapsamda olmalıdır. Denemelerin günlük çalışma toplamına katılıp katılmadığı backend ürün sözleşmesinde sabitlenmelidir.
- Deneme neti `correct - wrong / netPenalty`. Her denemede kullanılan kural saklanır; varsayılan 4'tür, formda değiştirilebilir. Backend netleri tekrar hesaplayıp doğrular. Boş sayıları nete etki etmez. Ders tekrarı kabul edilmez.
- Gelişim grafikleri son üç ayda aynı dersin en az iki gerçek sonucunu kullanır. Genel eğilim, karşılaştırılabilir derslerin ilk-son farklarının aritmetik ortalamasıdır; ölçme eşdeğerliği iddiası değildir.
- Plan taşıma yalnızca `plannedDate` günceller. Ödevin `dueDate` değeri değişmez. Plan kaydının silinmesi ödevi silmez.
- Öğretmen mesaj kodları: `heart`, `check`, `great`, `going-well`, `study-more`, `try-again`. Öğrenci ana sayfasında en yeni üç mesaj gösterilir; hazır seçenekler gönderilmiş mesaj sayılmaz.

## Gizlilik ve oturum sınırı

`TeacherStudentOverview` modeli yalnızca öğrenci özeti, günlük özet, ödevler, tamamlamalar, hedefler, gerçekleşmeler, yanlışlar, denemeler ve dersler içerir. `PrivateNote` ve `noteService` öğretmen sayfasına aktarılmaz. `teacherService.getStudent()` yanıtın üst alanlarını izin listesiyle seçer; öğrenci profilinin yalnızca id, isim, sınıf ve avatarını geçirir. Backend özel notları öğretmen yanıtına hiçbir biçimde eklememeli ve bütün `/private-notes` yollarında sahibi dışında erişimi reddetmelidir.

Bağlantısız kipte öğrenci ve öğretmen rotaları inceleme için açık, veriler boştur. API açıkken yerleşim oturum sorgusunu bekler; yanlış rol veya oturumsuz erişimde alt sayfalar ve veri sorguları yüklenmeden erişim ekranı gösterilir. Bu bir gerçek güvenlik sınırı değildir; yetkilendirme mutlaka backend'de uygulanır.

İstemci `credentials: 'include'` kullanmaya hazırdır; oturum backend'in HttpOnly çereziyle veya servis istemcisinde uyarlanacak başka bir yöntemle yönetilebilir. Frontend depolamaya token yazmaz. GitHub Pages kullanırken CORS, cookie politikası ve CSRF tedbirlerini backend belirler. Herhangi bir çerez / kimlik sağlayıcı bu projede oluşturulmamıştır.

## Durumlar ve hatalar

- `useQuery`: loading → success veya error; Retry yeniden istek yapar. Boş veri ayrıca sayfaya özgü Empty bileşeninde gösterilir.
- `SaveForm`: doğrulama → busy → gerçek başarı veya hata. Başarıda sorgular yenilenir; diyaloglar kapanır. Formda kalan başarı akışları başarı mesajı gösterir. Hata halinde girişler korunur.
- 401: giriş gerekli; 403: erişim yok; 422: bilgileri kontrol et; diğer HTTP hataları: işlem tamamlanamadı. Ağ / 15 saniye zaman aşımı hatası Türkçe gösterilir.
- 204 yanıt gövdesiz işlenir. Diğer başarılı yanıtlar JSON olmalıdır.
- Backend kapalıysa ağ isteği yapılmaz; okuma boş, yazma `UNAVAILABLE` olur. Gerçek başarılı kayıt simüle edilmez.

## Bağladıktan sonra doğrulanacak akış

Gerçek ders kataloğunu sağla → gerçek öğrenci hesabı oluştur → backend'in kodunu profilde göster → ödev gir ve sonuç toplamını doğrula → yanlışların tek kez oluştuğunu kontrol et → hedef ve deneme yanlışlarını denetle → haftalık plan tarihini değiştir → öğretmeni kodla bağla → özel not endpoint'lerinin öğretmene kapalı olduğunu doğrula → hazır mesajı gönder ve öğrenci ana sayfasında gör → hesap silmenin sunucu politikasını doğrula.
