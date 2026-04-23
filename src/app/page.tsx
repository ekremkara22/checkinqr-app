"use client";

import { motion, type Variants } from "framer-motion";
import {
  QrCode,
  Smartphone,
  LayoutDashboard,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  return (
    <main className={styles.main}>
      <nav className={styles.navbar}>
        <div className={`container ${styles.navContainer}`}>
          <div className={styles.logo}>
            CheckIn<span className="text-gradient">QR</span>
          </div>
          <div className={styles.navLinks}>
            <Link href="#ozellikler" className={styles.navLink}>
              Özellikler
            </Link>
            <Link href="#paketler" className={styles.navLink}>
              Paketler
            </Link>
            <Link
              href="/login"
              className="btn-primary"
              style={{ padding: "0.5rem 1.5rem", fontSize: "0.9rem" }}
            >
              Panel Giriş
            </Link>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroBgGlow} />
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.h1 variants={fadeUp} className={styles.heroTitle}>
              Turnike Yok, Maliyet Yok. <br />
              <span className="text-gradient">Yeni Nesil Yoklama</span> Sistemi.
            </motion.h1>
            <motion.p variants={fadeUp} className={styles.heroSubtitle}>
              Sadece bir doğrulama ekranı ve akıllı telefonlarla, işletmenizin
              personel devam kontrolünü tamamen dijitalleştirin. Bulut tabanlı
              panel üzerinden anlık raporlar alın.
            </motion.p>
            <motion.div variants={fadeUp} className={styles.heroBtns}>
              <Link href="#paketler" className="btn-primary">
                Hemen Başlayın
              </Link>
              <Link href="#ozellikler" className="btn-outline">
                Daha Fazla Bilgi
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="ozellikler" className={styles.features}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Sistem Nasıl <span className="text-gradient">Çalışır?</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Karmaşık donanımlara son. Üç basit bileşenle tam kontrol.
            </p>
          </div>

          <motion.div
            className={styles.featuresGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <QrCode size={24} />
              </div>
              <h3>Dinamik Karekod Cihazı</h3>
              <p>
                Firmanızın girişinde yer alan tablet veya özel cihaz, her 10
                saniyede bir değişen güvenli ve dinamik QR kodlar üretir.
                Sistemi sadece WiFi&apos;a bağlamak yeterlidir.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Smartphone size={24} />
              </div>
              <h3>Personel Mobil Uygulaması</h3>
              <p>
                Personeliniz kendi akıllı telefonu ile girişteki karekodu
                okutur. Konum doğrulaması ile sahte girişler engellenir ve işlem
                saniyeler içinde tamamlanır.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <LayoutDashboard size={24} />
              </div>
              <h3>Akıllı Yönetim Paneli</h3>
              <p>
                Bulut tabanlı panelinizden kimlerin içeride olduğunu anlık görün,
                ay sonu raporlarını birkaç tıkla dışa aktarın ve tüm akışı tek
                merkezden yönetin.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="paketler" className={styles.pricing}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Esnek <span className="text-gradient">Paketler</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              İşletmenizin büyüklüğüne en uygun paketi seçin.
            </p>
          </div>

          <motion.div
            className={styles.pricingGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className={`glass-panel ${styles.pricingCard}`}>
              <div className={styles.planName}>Kobi Başlangıç</div>
              <div className={styles.planPrice}>
                ₺999<span>/aylık</span>
              </div>
              <ul className={styles.planFeatures}>
                <li>
                  <CheckCircle2 size={18} /> 50 Personele Kadar
                </li>
                <li>
                  <CheckCircle2 size={18} /> 1 Adet QR Cihazı Lisansı
                </li>
                <li>
                  <CheckCircle2 size={18} /> Temel Raporlama
                </li>
                <li>
                  <CheckCircle2 size={18} /> E-Posta Desteği
                </li>
              </ul>
              <button className="btn-outline" style={{ width: "100%" }}>
                Satın Al
              </button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className={`glass-panel ${styles.pricingCard} ${styles.popular}`}
            >
              <div className={styles.popularBadge}>En Çok Tercih Edilen</div>
              <div className={styles.planName}>Kurumsal Pro</div>
              <div className={styles.planPrice}>
                ₺2499<span>/aylık</span>
              </div>
              <ul className={styles.planFeatures}>
                <li>
                  <CheckCircle2 size={18} /> Sınırsız Personel
                </li>
                <li>
                  <CheckCircle2 size={18} /> Sınırsız QR Cihazı Lisansı
                </li>
                <li>
                  <CheckCircle2 size={18} /> Gelişmiş Excel ve PDF Çıktı
                </li>
                <li>
                  <CheckCircle2 size={18} /> Konum Tabanlı GPS Doğrulama
                </li>
                <li>
                  <CheckCircle2 size={18} /> 7/24 Öncelikli Destek
                </li>
              </ul>
              <button className="btn-primary" style={{ width: "100%" }}>
                Satın Al{" "}
                <ArrowRight size={16} style={{ display: "inline", marginLeft: "5px" }} />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          <p>© {new Date().getFullYear()} CheckInQR PDKS. Tüm Hakları Saklıdır.</p>
        </div>
      </footer>
    </main>
  );
}
