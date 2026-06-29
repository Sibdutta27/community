import StatCard from '../../components/StatCard/StatCard.jsx';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  return (
    <section className={styles.page}>
      <div className={styles.headerBlock}>
        <h1>Dashboard Overview</h1>
        <p>A simple admin skeleton page with reusable cards and clean structure.</p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard title="Total Revenue" value="$24.8k" helper="+12.5% this month" />
        <StatCard title="Active Users" value="1,284" helper="+8.2% this week" />
        <StatCard title="New Orders" value="342" helper="+19 today" />
      </div>

      <div className={styles.panelGrid}>
        <div className={styles.panel}>
          <h2>Recent Activity</h2>
          <ul>
            <li>New user registered</li>
            <li>Invoice generated</li>
            <li>Campaign report updated</li>
          </ul>
        </div>
        <div className={styles.panel}>
          <h2>Quick Notes</h2>
          <p>Use this layout as a starting point for a SaaS admin, client portal, CRM, or analytics dashboard.</p>
        </div>
      </div>
    </section>
  );
}
