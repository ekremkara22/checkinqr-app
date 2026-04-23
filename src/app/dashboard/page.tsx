import {
  Building2,
  Coffee,
  DoorClosed,
  DoorOpen,
  MonitorSmartphone,
  ShieldCheck,
  Soup,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import styles from "./page.module.css";

const attendanceLabels = {
  ENTRY: "Giris",
  EXIT: "Cikis",
  BREAK_START: "Mola Giris",
  BREAK_END: "Mola Cikis",
  MEAL_START: "Yemek Giris",
  MEAL_END: "Yemek Cikis",
} as const;

function getRoleLabel(role: string) {
  return role === "SUPERADMIN" ? "Super Admin" : "Firma Admin";
}

function getUserFullName(user: {
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  email: string;
}) {
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.name || user.email;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default async function DashboardPage() {
  const { user } = await requireSessionUser();
  const isSuperadmin = user.role === "SUPERADMIN";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendanceWhere = isSuperadmin
    ? undefined
    : {
        employee: {
          companyId: user.companyId ?? undefined,
        },
      };

  const employeeWhere = isSuperadmin
    ? undefined
    : {
        companyId: user.companyId ?? undefined,
      };

  const deviceWhere = isSuperadmin
    ? undefined
    : {
        companyId: user.companyId ?? undefined,
      };

  const companyWhere = isSuperadmin ? undefined : { id: user.companyId ?? undefined };

  const [
    companyCount,
    companyAdminCount,
    employeeCount,
    deviceCount,
    highlightedCompanies,
    scopedEmployees,
    recentLogs,
    companyDevices,
    todayEntryCount,
    todayExitCount,
    todayBreakStartCount,
    todayBreakEndCount,
    todayMealStartCount,
    todayMealEndCount,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.user.count({ where: { role: "COMPANY_ADMIN" } }),
    prisma.employee.count({ where: employeeWhere }),
    prisma.device.count({ where: deviceWhere }),
    prisma.company.findMany({
      where: companyWhere,
      include: {
        users: {
          where: { role: "COMPANY_ADMIN" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            employees: true,
            devices: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: isSuperadmin ? 6 : 1,
    }),
    prisma.employee.findMany({
      where: employeeWhere,
      include: {
        company: true,
      },
      orderBy: [{ createdAt: "desc" }],
      take: 8,
    }),
    prisma.attendanceLog.findMany({
      where: attendanceWhere,
      include: {
        employee: {
          include: {
            company: true,
          },
        },
        device: true,
      },
      orderBy: { scannedAt: "desc" },
      take: 10,
    }),
    prisma.device.findMany({
      where: deviceWhere,
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.attendanceLog.count({
      where: {
        scannedAt: { gte: today },
        type: "ENTRY",
        ...attendanceWhere,
      },
    }),
    prisma.attendanceLog.count({
      where: {
        scannedAt: { gte: today },
        type: "EXIT",
        ...attendanceWhere,
      },
    }),
    prisma.attendanceLog.count({
      where: {
        scannedAt: { gte: today },
        type: "BREAK_START",
        ...attendanceWhere,
      },
    }),
    prisma.attendanceLog.count({
      where: {
        scannedAt: { gte: today },
        type: "BREAK_END",
        ...attendanceWhere,
      },
    }),
    prisma.attendanceLog.count({
      where: {
        scannedAt: { gte: today },
        type: "MEAL_START",
        ...attendanceWhere,
      },
    }),
    prisma.attendanceLog.count({
      where: {
        scannedAt: { gte: today },
        type: "MEAL_END",
        ...attendanceWhere,
      },
    }),
  ]);

  const summaryCards = isSuperadmin
    ? [
        { label: "Toplam Firma", value: companyCount, icon: Building2 },
        { label: "Firma Yoneticisi", value: companyAdminCount, icon: ShieldCheck },
        { label: "Toplam Personel", value: employeeCount, icon: Users },
        { label: "Toplam Cihaz", value: deviceCount, icon: MonitorSmartphone },
      ]
    : [
        { label: "Firma", value: user.company?.name ?? "-", icon: Building2 },
        { label: "Kayitli Personel", value: employeeCount, icon: Users },
        { label: "Cihaz", value: deviceCount, icon: MonitorSmartphone },
        { label: "Bugun Giris", value: todayEntryCount, icon: DoorOpen },
      ];

  const reportCards = [
    { label: "Giris", value: todayEntryCount, icon: DoorOpen },
    { label: "Cikis", value: todayExitCount, icon: DoorClosed },
    { label: "Mola Giris", value: todayBreakStartCount, icon: Coffee },
    { label: "Mola Cikis", value: todayBreakEndCount, icon: Coffee },
    { label: "Yemek Giris", value: todayMealStartCount, icon: Soup },
    { label: "Yemek Cikis", value: todayMealEndCount, icon: Soup },
  ];

  return (
    <div className={styles.page}>
      <section className={`glass-panel ${styles.heroCard}`}>
        <div>
          <p className={styles.eyebrow}>QR PDKS Dashboard</p>
          <h1 className={styles.title}>Hos geldin, {getUserFullName(user)}</h1>
          <p className={styles.subtitle}>
            {isSuperadmin
              ? "Panel ana sayfasinda tum firmalarin son durumunu gorebilir, detayli islemleri sol menuden yonetebilirsin."
              : "Panel ana sayfasinda firmanin hareket ozetini gorebilir, detayli yonetim ekranlarina sol menuden gecis yapabilirsin."}
          </p>
        </div>

        <div className={styles.heroMeta}>
          <div className={styles.rolePill}>{getRoleLabel(user.role)}</div>
          <div className={styles.helperText}>Bugunluk operasyon ozeti anlik olarak listelenir.</div>
        </div>
      </section>

      <section className={styles.metricsGrid}>
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className={`glass-panel ${styles.metricCard}`}>
              <div className={styles.metricIcon}>
                <Icon size={18} />
              </div>
              <p className={styles.metricLabel}>{card.label}</p>
              <p className={styles.metricValue}>{card.value}</p>
            </article>
          );
        })}
      </section>

      <section className={styles.mainGrid}>
        <div className={styles.primaryColumn}>
          <section className={`glass-panel ${styles.sectionCard}`}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>
                  {isSuperadmin ? "Firma Genel Gorunum" : "Firma Ozet Kartlari"}
                </p>
                <h2 className={styles.sectionTitle}>
                  {isSuperadmin ? "Musteri Firmalar" : "Firma Detaylari"}
                </h2>
              </div>
            </div>

            <div className={styles.cardGrid}>
              {highlightedCompanies.map((company) => (
                <article key={company.id} className={styles.infoCard}>
                  <div className={styles.infoCardTop}>
                    <div>
                      <p className={styles.infoCardTitle}>{company.name}</p>
                      <p className={styles.infoCardMeta}>
                        {company.users[0]
                          ? getUserFullName(company.users[0])
                          : "Firma admini tanimlanmadi"}
                      </p>
                    </div>
                    <div className={styles.countPill}>{company._count.employees} personel</div>
                  </div>

                  <p className={styles.infoCardBody}>
                    {company.address ?? "Adres bilgisi henuz girilmedi."}
                  </p>

                  <div className={styles.infoCardFooter}>
                    <span>Iletisim: {company.contactEmail ?? company.contactPhone ?? "-"}</span>
                    <span>{company._count.devices} cihaz</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={`glass-panel ${styles.sectionCard}`}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>
                  {isSuperadmin ? "Yeni Kayitlar" : "Personel Takibi"}
                </p>
                <h2 className={styles.sectionTitle}>
                  {isSuperadmin ? "Son Eklenen Personeller" : "Kayitli Personeller"}
                </h2>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Personel</th>
                    <th>Firma</th>
                    <th>Departman</th>
                    <th>Konum Alani</th>
                  </tr>
                </thead>
                <tbody>
                  {scopedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={styles.emptyCell}>
                        Henuz kayitli personel yok.
                      </td>
                    </tr>
                  ) : (
                    scopedEmployees.map((employee) => (
                      <tr key={employee.id}>
                        <td>
                          {employee.firstName} {employee.lastName}
                        </td>
                        <td>{employee.company.name}</td>
                        <td>{employee.department}</td>
                        <td>
                          {employee.allowedLatitude ?? "-"}, {employee.allowedLongitude ?? "-"}
                          <div className={styles.mutedRow}>
                            {employee.allowedRadiusM ? `${employee.allowedRadiusM} m` : "-"}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className={styles.sideColumn}>
          <section className={`glass-panel ${styles.sectionCard}`}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>PDKS Ozet</p>
                <h2 className={styles.sectionTitle}>Bugunku Hareket Tipleri</h2>
              </div>
            </div>

            <div className={styles.reportGrid}>
              {reportCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.label} className={styles.reportCard}>
                    <div className={styles.reportIcon}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className={styles.reportLabel}>{card.label}</p>
                      <p className={styles.reportValue}>{card.value}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={`glass-panel ${styles.sectionCard}`}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>QR Cihazlar</p>
                <h2 className={styles.sectionTitle}>Aktif UUID Durumu</h2>
              </div>
            </div>

            <div className={styles.logList}>
              {companyDevices.length === 0 ? (
                <p className={styles.emptyState}>Henuz kayitli cihaz yok.</p>
              ) : (
                companyDevices.map((device) => (
                  <article key={device.id} className={styles.logItem}>
                    <div>
                      <p className={styles.logTitle}>{device.name}</p>
                      <p className={styles.logMeta}>Secret Key: {device.secretKey}</p>
                    </div>
                    <div className={styles.logMetaRight}>
                      <p>{device.activeQrToken ?? "UUID bekleniyor"}</p>
                      <p>
                        {device.qrExpiresAt
                          ? `Bitis: ${formatDate(device.qrExpiresAt)}`
                          : "Sure yok"}
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className={`glass-panel ${styles.sectionCard}`}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Rapor</p>
                <h2 className={styles.sectionTitle}>Son Hareketler</h2>
              </div>
            </div>

            <div className={styles.logList}>
              {recentLogs.length === 0 ? (
                <p className={styles.emptyState}>
                  Henuz kayitli hareket yok. Giris ve cikis hareketlerinde QR ve konum
                  teyitleri burada gorunecek.
                </p>
              ) : (
                recentLogs.map((log) => (
                  <article key={log.id} className={styles.logItem}>
                    <div>
                      <p className={styles.logTitle}>
                        {log.employee.firstName} {log.employee.lastName}
                      </p>
                      <p className={styles.logMeta}>
                        {attendanceLabels[log.type]} - {log.employee.company.name}
                      </p>
                      {log.type === "ENTRY" || log.type === "EXIT" ? (
                        <p className={styles.mutedRow}>
                          QR: {log.qrMatched ? "Dogrulandi" : "Yok"} | Konum:{" "}
                          {log.locationValid ? "Uygun" : "Yok"}
                        </p>
                      ) : null}
                    </div>
                    <div className={styles.logMetaRight}>
                      <p>{formatDate(log.scannedAt)}</p>
                      <p>{log.device?.name ?? "Cihaz gerekmiyor"}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
