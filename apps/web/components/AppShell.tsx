"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  FileText,
  Gauge,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const navigation = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Projects", "/projects", BriefcaseBusiness],
  ["My tasks", "/tasks", Gauge],
  ["Teams & people", "/teams", Users],
  ["Clients", "/clients", Users],
  ["Messages", "/messages", MessageSquare],
  ["Meetings", "/meetings", CalendarDays],
  ["Documents", "/documents", FileText],
  ["Admin console", "/admin", ShieldCheck],
  ["Settings", "/settings", Settings],
] as const;
const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Good morning, Muhamad.", subtitle: "Here’s a clear view of your organization." },
  "/projects": { title: "Projects", subtitle: "Every initiative, organized around outcomes." },
  "/tasks": { title: "My tasks", subtitle: "Focus on the work that moves delivery forward." },
  "/teams": { title: "Teams & people", subtitle: "The people and structure behind your work." },
  "/clients": { title: "Clients", subtitle: "Healthy relationships, visible at a glance." },
  "/messages": { title: "Messages", subtitle: "A focused place for the conversations that matter." },
  "/meetings": { title: "Meetings", subtitle: "Keep every decision and commitment in context." },
  "/documents": { title: "Documents", subtitle: "Shared knowledge, structured for your organization." },
  "/admin": { title: "Admin console", subtitle: "Roles, access, and auditability in one place." },
  "/settings": { title: "Settings", subtitle: "Personalize your Synthetix workspace." },
};
const tables: Record<string, { headers: string[]; rows: string[][] }> = {
  "/projects": {
    headers: ["Project", "Client", "Status", "Due date"],
    rows: [
      ["Atlas Intelligence", "Northstar Labs", "Active", "Sep 30, 2026"],
      ["Signal Operations", "Umbra Group", "Planning", "Oct 18, 2026"],
      ["Meridian Portal", "Kite & Co.", "On hold", "Nov 02, 2026"],
    ],
  },
  "/tasks": {
    headers: ["Task", "Project", "Status", "Due"],
    rows: [
      ["Ship analytics command center", "Atlas Intelligence", "In progress", "Aug 06"],
      ["Validate data retention policy", "Signal Operations", "In review", "Aug 08"],
      ["Prepare client health brief", "Meridian Portal", "To do", "Aug 12"],
    ],
  },
  "/clients": {
    headers: ["Company", "Primary contact", "Status", "Projects"],
    rows: [
      ["Northstar Labs", "Jordan Lee", "Active", "3 projects"],
      ["Umbra Group", "Iris Chen", "Active", "1 project"],
      ["Kite & Co.", "Rafael Ortiz", "Prospect", "—"],
    ],
  },
  "/documents": {
    headers: ["Document", "Category", "Updated", "Type"],
    rows: [
      ["Atlas research brief", "Strategy", "Jul 24, 2026", "PDF"],
      ["Q3 operating plan", "Finance", "Jul 22, 2026", "DOCX"],
      ["Client discovery notes", "Research", "Jul 18, 2026", "NOTES"],
    ],
  },
  "/admin": {
    headers: ["User", "Role", "Status", "Last active"],
    rows: [
      ["MUHAMAD SHAKIR", "Admin", "Active", "Today, 09:12"],
      ["Maya Patel", "Manager", "Active", "Yesterday"],
      ["Theo Hart", "Employee", "Active", "Jul 21"],
    ],
  },
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}
function Badge({ children }: { children: string }) {
  return <span className={`badge ${children.toLowerCase().replaceAll(" ", "-")}`}>{children}</span>;
}

export default function AppShell() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const key = pathname.startsWith("/projects/") ? "/projects" : pathname;
  const meta = pageMeta[key] ?? pageMeta["/dashboard"];
  return (
    <div className="app">
      <aside className={menuOpen ? "side open" : "side"}>
        <div className="brand">
          <span className="mark">
            <Sparkles size={17} />
          </span>
          <span>SYNTHETIX</span>
          <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <nav>
          {navigation.map(([label, href, Icon]) => (
            <a key={href} href={href} className={key === href ? "active" : ""}>
              <Icon size={18} />
              <span>{label}</span>
              {label === "Messages" && <i>3</i>}
            </a>
          ))}
        </nav>
        <div className="side-foot">
          <a href="/settings">
            <CircleHelp size={17} />
            Support
          </a>
          <div className="person">
            <span>AS</span>
            <div>
              MUHAMAD SHAKIR<small>Student · University of the Punjab, Lahore</small>
            </div>
            <ChevronDown size={15} />
          </div>
        </div>
      </aside>
      <main>
        <header>
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation">
            <Menu />
          </button>
          <div className="search">
            <Search size={17} />
            <input aria-label="Global search" placeholder="Search workspace…" />
            <kbd>⌘ K</kbd>
          </div>
          <button className="icon" aria-label="Notifications">
            <Bell size={19} />
            <b />
          </button>
          <span className="avatar">MS</span>
        </header>
        <div className="content">
          <div className="title-row">
            <div>
              <p className="eyebrow">WORKSPACE / OVERVIEW</p>
              <h1>{meta.title}</h1>
              <p className="sub">{meta.subtitle}</p>
            </div>
            {key !== "/dashboard" && (
              <button className="primary">
                <Plus size={17} />
                New item
              </button>
            )}
          </div>
          <Page path={key} />
        </div>
      </main>
    </div>
  );
}

function Page({ path }: { path: string }) {
  if (path === "/dashboard") return <Dashboard />;
  if (path === "/messages") return <Messages />;
  if (path === "/meetings") return <Meetings />;
  if (path === "/teams") return <Teams />;
  if (path === "/settings") return <SettingsPage />;
  return <Directory table={tables[path] ?? tables["/projects"]} />;
}

function Dashboard() {
  const trend = [
    { n: "Mon", v: 32 },
    { n: "Tue", v: 46 },
    { n: "Wed", v: 42 },
    { n: "Thu", v: 63 },
    { n: "Fri", v: 58 },
    { n: "Sat", v: 72 },
    { n: "Sun", v: 86 },
  ];
  const workload = [
    { n: "Shakir", v: 7 },
    { n: "Maya", v: 5 },
    { n: "Theo", v: 4 },
    { n: "Iris", v: 3 },
  ];
  return (
    <>
      <div className="kpis">
        {[
          ["Active projects", "12", "+12.5%", "Emerging stronger"],
          ["Open tasks", "48", "4 overdue", "Needs attention"],
          ["Team utilization", "84%", "+4.2%", "Within healthy range"],
          ["Active clients", "26", "+3 this quarter", "Portfolio growing"],
        ].map(([label, value, trendText, helper], index) => (
          <Card key={label}>
            <p className="label">{label}</p>
            <strong>{value}</strong>
            <div>
              <span className={index === 1 ? "risk" : "up"}>{trendText}</span>
              <small>{helper}</small>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid chart-grid">
        <Card>
          <div className="card-head">
            <div>
              <p className="label">TASK VELOCITY</p>
              <h2>Completion trend</h2>
            </div>
            <button className="ghost">
              30 days <ChevronDown size={14} />
            </button>
          </div>
          <div className="chart">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="velocity-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop stopColor="#4f46e5" stopOpacity=".5" />
                    <stop offset="1" stopColor="#4f46e5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <Tooltip />
                <Area type="monotone" dataKey="v" stroke="#c3c0ff" strokeWidth={2} fill="url(#velocity-fill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <div className="card-head">
            <div>
              <p className="label">PROJECT HEALTH</p>
              <h2>Status distribution</h2>
            </div>
          </div>
          <div className="donut">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[{ value: 7 }, { value: 3 }, { value: 2 }]}
                  dataKey="value"
                  innerRadius={53}
                  outerRadius={72}
                  paddingAngle={4}
                >
                  {["#c3c0ff", "#4edea3", "#adc6ff"].map((color) => (
                    <Cell key={color} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div>
              <b>12</b>
              <small>Projects</small>
            </div>
          </div>
          <p className="legend">
            <i />
            Active <i />
            Planning <i />
            On hold
          </p>
        </Card>
      </div>
      <div className="grid lower">
        <Card>
          <div className="card-head">
            <div>
              <p className="label">TEAM CAPACITY</p>
              <h2>Workload distribution</h2>
            </div>
            <button className="ghost">View team</button>
          </div>
          <div className="chart short">
            <ResponsiveContainer>
              <BarChart data={workload}>
                <Tooltip />
                <Bar dataKey="v" fill="#4edea3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="ai">
          <div className="ai-title">
            <Sparkles size={17} />
            <p className="label">AI OPERATIONS INSIGHT</p>
          </div>
          <h2>Delivery is trending healthy</h2>
          <p>Velocity rose 18% this cycle. Two tasks need review before Friday to protect the current forecast.</p>
          <a href="/projects">Explore underlying work →</a>
        </Card>
        <Card>
          <div className="card-head">
            <div>
              <p className="label">UPCOMING</p>
              <h2>Deadlines</h2>
            </div>
            <button className="ghost">View all</button>
          </div>
          {["Analytics command center", "Client health brief", "Data retention policy"].map((title, index) => (
            <div className="deadline" key={title}>
              <span className={index === 0 ? "urgent" : ""}>{index === 0 ? "06" : `0${8 + index}`}</span>
              <div>
                {title}
                <small>{index === 0 ? "Tomorrow" : `August ${8 + index}`}</small>
              </div>
              <Badge>{index === 0 ? "High" : "Medium"}</Badge>
            </div>
          ))}
        </Card>
      </div>
      <Card className="activity">
        <div className="card-head">
          <div>
            <p className="label">LIVE ACTIVITY</p>
            <h2>Recent workspace activity</h2>
          </div>
          <span className="live">Live</span>
        </div>
        {[
          "Muhamad moved Analytics command center to In progress",
          "Maya shared a client update in Atlas Intelligence",
          "Theo completed Data source mapping",
        ].map((activity, index) => (
          <div className="activity-row" key={activity}>
            <span>{["AS", "MP", "TH"][index]}</span>
            <p>
              {activity}
              <small>{index + 1}h ago</small>
            </p>
          </div>
        ))}
      </Card>
    </>
  );
}

function Directory({ table }: { table: { headers: string[]; rows: string[][] } }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(
    () => table.rows.filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase())),
    [query, table],
  );
  return (
    <Card className="directory">
      <div className="table-tools">
        <div className="filter">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${table.headers[0].toLowerCase()}s…`}
          />
        </div>
        <button className="ghost">Filter</button>
        <button className="ghost">Sort</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {table.headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, index) => (
                  <td key={`${row[0]}-${cell}`}>
                    {index === 2 && /active|planning|hold|progress|review|to do|prospect/i.test(cell) ? (
                      <Badge>{cell}</Badge>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <span>
          Showing 1–{visible.length} of {visible.length}
        </span>
        <div>
          <button className="ghost">Previous</button>
          <button className="ghost">Next</button>
        </div>
      </div>
    </Card>
  );
}

function Messages() {
  const [message, setMessage] = useState("");
  const [items, setItems] = useState([
    "The client readout is ready for a final review.",
    "I’ll bring the dashboard numbers and close the loop today.",
    "I added the latest delivery metrics to the brief.",
  ]);
  function send() {
    if (message.trim()) {
      setItems([...items, message.trim()]);
      setMessage("");
    }
  }
  return (
    <div className="messages">
      <Card className="channels">
        <p className="label">CHANNELS</p>
        {["general", "product-delivery", "client-success"].map((channel, index) => (
          <button className={index === 0 ? "selected" : ""} key={channel}>
            # {channel}
            <span>{index === 0 ? "3" : ""}</span>
          </button>
        ))}
      </Card>
      <Card className="conversation">
        <div className="conversation-head">
          <div>
            <h2># general</h2>
            <p>12 members · active now</p>
          </div>
          <button className="ghost">Details</button>
        </div>
        {items.map((item, index) => (
          <div className="message" key={`${item}-${index}`}>
            <span>{index % 2 ? "AS" : "MP"}</span>
            <div>
              <b>{index % 2 ? "MUHAMAD SHAKIR" : "Maya Patel"}</b>
              <small>10:{24 + index} AM</small>
              <p>{item}</p>
            </div>
          </div>
        ))}
        <div className="composer">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && send()}
            placeholder="Message #general"
          />
          <button className="primary" onClick={send}>
            Send
          </button>
        </div>
      </Card>
    </div>
  );
}

function Meetings() {
  return (
    <div className="meeting-grid">
      <Card>
        <p className="label">AUGUST 2026</p>
        <h2>Today’s schedule</h2>
        {[
          ["09:30", "Delivery leadership sync", "30 min"],
          ["13:00", "Northstar product review", "45 min"],
          ["16:30", "AI operations briefing", "60 min"],
        ].map(([time, title, duration]) => (
          <div className="meeting" key={title}>
            <b>{time}</b>
            <div>
              {title}
              <small>{duration} · Video room</small>
            </div>
            <Badge>Confirmed</Badge>
          </div>
        ))}
      </Card>
      <Card>
        <p className="label">CALENDAR</p>
        <h2>July 2026</h2>
        <div className="calendar">
          {Array.from({ length: 35 }, (_, index) => (
            <span className={index === 24 ? "today" : ""} key={index}>
              {index < 3 ? "" : index - 2}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
function Teams() {
  return (
    <div className="team-grid">
      <Card>
        <p className="label">ORGANIZATION</p>
        <h2>Product Engineering</h2>
        <p className="sub">A cross-functional team building the operating system for intelligent work.</p>
        <div className="members">
          {["AS", "MP", "TH", "IC"].map((member) => (
            <span key={member}>{member}</span>
          ))}
          <b>+8</b>
        </div>
      </Card>
      <Card>
        <p className="label">DIRECTORY</p>
        <h2>People</h2>
        {[
          "MUHAMAD SHAKIR — Student, University of the Punjab",
          "Maya Patel — Product Manager",
          "Theo Hart — Data Engineer",
          "Iris Chen — Client Success",
        ].map((person) => (
          <div className="person-row" key={person}>
            <span>
              {person
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
            <p>
              {person}
              <small>Active now</small>
            </p>
          </div>
        ))}
      </Card>
    </div>
  );
}
function SettingsPage() {
  return (
    <div className="settings">
      <Card>
        <p className="label">PROFILE</p>
        <h2>Your workspace identity</h2>
        <div className="profile">
          <span className="avatar big">MS</span>
          <div>
            <b>MUHAMAD SHAKIR</b>
            <p>muhammadshakir786rrr@gmail.com</p>
            <button className="ghost">Change avatar</button>
          </div>
        </div>
        <div className="form">
          <label>
            First name
            <input defaultValue="MUHAMAD" />
          </label>
          <label>
            Last name
            <input defaultValue="SHAKIR" />
          </label>
          <label className="wide">
            Email
            <input defaultValue="muhammadshakir786rrr@gmail.com" />
          </label>
        </div>
        <button className="primary">Save changes</button>
      </Card>
      <Card>
        <p className="label">PREFERENCES</p>
        <h2>Notifications</h2>
        {["Task assignments", "Project activity", "Weekly operating digest"].map((preference) => (
          <div className="toggle" key={preference}>
            {preference}
            <button aria-label={`Toggle ${preference}`}>
              <i />
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}
