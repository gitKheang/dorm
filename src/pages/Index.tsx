import { Link } from "react-router-dom";
import {
  ArrowRight,
  BedDouble,
  Building2,
  CalendarRange,
  ChefHat,
  ChevronRight,
  ClipboardList,
  DoorOpen,
  LayoutDashboard,
  MapPinned,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import dormHero from "@/assets/dorm-hero.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type IconEntry = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const roleCards: IconEntry[] = [
  {
    icon: Building2,
    title: "Landlord workspace",
    description: "Create dorms, invite members, manage rooms, publish meal rules, and track payments from one controlled workspace.",
  },
  {
    icon: DoorOpen,
    title: "Tenant access",
    description: "Tenants join only by invitation, then manage their own meals, invoices, room details, and maintenance requests.",
  },
  {
    icon: ChefHat,
    title: "Chef operations",
    description: "Chefs see the dorm they belong to, publish meal plans, and prep from live meal counts without touching billing or room data.",
  },
];

const featureCards: Array<IconEntry & { accent: string }> = [
  {
    icon: MapPinned,
    title: "Multi-dorm control",
    description: "One landlord can run several dorms in different locations and switch workspace context instantly.",
    accent: "from-sky-100 via-white to-sky-50",
  },
  {
    icon: BedDouble,
    title: "Rooms and seat assignment",
    description: "Keep occupancy, rent, move-in dates, and move-out history tied to the correct tenant membership.",
    accent: "from-amber-100 via-white to-orange-50",
  },
  {
    icon: UtensilsCrossed,
    title: "Meal cutoffs that make sense",
    description: "Meal planning, tenant toggles, and per-day prep counts all stay linked to dorm policy and billing logic.",
    accent: "from-emerald-100 via-white to-teal-50",
  },
  {
    icon: Receipt,
    title: "Billing without spreadsheet drift",
    description: "Generate invoices from stored assignments and meal choices, then record manual payments with status tracking.",
    accent: "from-blue-100 via-white to-indigo-50",
  },
  {
    icon: Wrench,
    title: "Maintenance visibility",
    description: "Tickets come from tenants, stay attached to the dorm and room context, and move through landlord-controlled resolution.",
    accent: "from-rose-100 via-white to-orange-50",
  },
  {
    icon: ShieldCheck,
    title: "Role-scoped access",
    description: "Landlords, tenants, and chefs each see only the dorm data and actions their membership allows.",
    accent: "from-slate-100 via-white to-slate-50",
  },
];

const workflowSteps: Array<IconEntry & { step: string }> = [
  {
    step: "01",
    icon: LayoutDashboard,
    title: "Create the dorm workspace",
    description: "A landlord starts the workspace and defines billing cadence, meal rate, and dorm policies.",
  },
  {
    step: "02",
    icon: Users,
    title: "Invite tenants and chefs",
    description: "People join by landlord-issued invite, so dorm membership stays controlled from the start.",
  },
  {
    step: "03",
    icon: CalendarRange,
    title: "Run the weekly operation",
    description: "Assign rooms, publish meals, respect cutoffs, and keep tenant actions linked to the correct dorm.",
  },
  {
    step: "04",
    icon: ClipboardList,
    title: "Close the month cleanly",
    description: "Generate invoices, record payments, and resolve maintenance with a clear audit trail.",
  },
];

const faqs = [
  {
    question: "Can one landlord manage several dorms from one account?",
    answer:
      "Yes. The system is designed around memberships, so one landlord can create and operate multiple dorm workspaces and switch between them.",
  },
  {
    question: "Can tenants or chefs join a dorm without the landlord?",
    answer:
      "No. They can create a DormFlow account, but their dorm membership is created only when they accept a landlord invitation.",
  },
  {
    question: "Can the same user belong to more than one dorm?",
    answer:
      "Yes. One person can have multiple memberships and even different roles across dorms, while the UI keeps one active dorm context at a time.",
  },
  {
    question: "Is DormFlow a public listing marketplace?",
    answer:
      "No. It is a private operations platform. Dorm data stays isolated inside each dorm workspace and is accessible only by membership.",
  },
];

const Index = () => {
  return (
    <div className="landing-shell min-h-screen overflow-x-hidden text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.2),transparent_32%),radial-gradient(circle_at_80%_12%,rgba(245,158,11,0.16),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,250,252,0))]"
      />

      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="container flex h-[72px] items-center justify-between gap-6 py-4">
          <Link to="/" className="flex items-center gap-3 text-foreground">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_16px_38px_rgba(15,23,42,0.18)]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">DormFlow</p>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Harmony</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#roles" className="transition-colors hover:text-foreground">
              Roles
            </a>
            <a href="#workflow" className="transition-colors hover:text-foreground">
              Workflow
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden rounded-full px-5 text-sm md:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-slate-950 px-5 text-sm text-white shadow-[0_18px_42px_rgba(15,23,42,0.16)] hover:bg-slate-800"
            >
              <Link to="/register">
                Start as landlord
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative">
          <div className="container grid gap-14 pb-20 pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pt-20">
            <div className="max-w-2xl space-y-8">
              <Badge
                variant="outline"
                className="rounded-full border-sky-200 bg-white/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-700 shadow-sm"
              >
                Landlord-controlled dorm operations
              </Badge>

              <div className="space-y-5">
                <h1 className="font-display text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                  Run every dorm with calm,
                  <span className="block text-sky-700">not chaos.</span>
                </h1>
                <p className="max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
                  DormFlow brings rooms, invitations, meal planning, billing, and maintenance into
                  one elegant system built for landlords managing one dorm or many locations.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-[54px] rounded-full bg-slate-950 px-7 text-base text-white shadow-[0_20px_44px_rgba(15,23,42,0.18)] hover:bg-slate-800"
                >
                  <Link to="/register">
                    Create landlord workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-[54px] rounded-full border-slate-200 bg-white/85 px-7 text-base text-slate-700 backdrop-blur hover:bg-slate-50"
                >
                  <Link to="/login">
                    Already invited?
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Private workspaces", "Membership-based dorm access"],
                  ["Multi-dorm ready", "Switch branches without data bleed"],
                  ["Operational billing", "Invoices grounded in stored activity"],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur"
                  >
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="landing-panel relative overflow-hidden p-4 sm:p-5">
                <div className="absolute inset-x-8 top-4 flex justify-between text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">
                  <span>DormFlow preview</span>
                  <span>Operations board</span>
                </div>

                <div className="relative overflow-hidden rounded-[24px] border border-white/40 bg-slate-950 pt-10 shadow-[0_26px_80px_rgba(15,23,42,0.24)]">
                  <img
                    src={dormHero}
                    alt="DormFlow workspace preview"
                    className="h-[320px] w-full object-cover object-center sm:h-[420px]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05),rgba(15,23,42,0.68))]" />

                  <div className="absolute inset-x-4 bottom-4 grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[24px] border border-white/15 bg-white/10 p-4 text-white backdrop-blur-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-white/70">
                            Sample operator view
                          </p>
                          <p className="mt-2 font-display text-2xl">3 dorms, one rhythm</p>
                        </div>
                        <Sparkles className="h-5 w-5 text-amber-300" />
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-white/80">
                        <div className="rounded-2xl bg-white/10 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Rooms</p>
                          <p className="mt-1 text-base font-semibold text-white">128</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Meals</p>
                          <p className="mt-1 text-base font-semibold text-white">82 today</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Due</p>
                          <p className="mt-1 text-base font-semibold text-white">12 invoices</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/15 bg-slate-950/55 p-4 text-white backdrop-blur-md">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/70">Today&apos;s priority</p>
                      <ul className="mt-3 space-y-3 text-sm">
                        {[
                          "Chef sees live breakfast and dinner counts",
                          "Landlord records cash payments without manual reconciliation",
                          "Tenants send maintenance with room context attached",
                        ].map((item) => (
                          <li key={item} className="flex gap-2 text-white/85">
                            <span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="animate-float absolute -left-5 top-10 hidden rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-[0_18px_42px_rgba(15,23,42,0.12)] backdrop-blur xl:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Active dorm</p>
                <p className="mt-2 font-display text-xl text-slate-900">Phnom Penh Central</p>
                <p className="mt-1 text-sm text-slate-600">Landlord workspace • 46 rooms</p>
              </div>

              <div className="animate-float-delayed absolute -bottom-6 right-2 hidden rounded-[24px] border border-sky-200 bg-sky-50/90 p-4 shadow-[0_18px_42px_rgba(14,165,233,0.12)] backdrop-blur lg:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">Chef board</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Lunch confirmed for 34 residents</p>
                <p className="mt-1 text-sm text-slate-600">Cutoff already locked for today</p>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-6">
          <div className="container">
            <div className="landing-panel px-6 py-5 sm:px-8">
              <div className="grid gap-4 text-sm text-slate-600 md:grid-cols-[0.9fr_1.1fr] md:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
                    Why this structure works
                  </p>
                  <p className="mt-2 font-display text-2xl text-slate-950">
                    Public platform account, private dorm workspace.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    "Landlords self-start and control the dorm.",
                    "Tenants and chefs join by invite only.",
                    "Every workflow stays scoped to the active dorm.",
                  ].map((item) => (
                    <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 leading-6 text-slate-600">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="roles" className="container py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Built around real roles</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              One system, three clean surfaces.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              DormFlow works because each person sees the right level of control, not an overloaded
              admin panel pretending to fit everyone.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {roleCards.map(({ icon: Icon, title, description }, index) => (
              <Card
                key={title}
                className={`overflow-hidden rounded-[28px] border-white/70 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur ${
                  index === 0 ? "lg:-translate-y-4" : ""
                }`}
              >
                <CardContent className="p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl text-slate-950">{title}</h3>
                  <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="workflow" className="container py-20">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600">Operational flow</p>
                <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  The workflow stays disciplined.
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Landlord control is established first, then rooms, meals, and billing follow from
                  real memberships instead of ad-hoc spreadsheets and side messages.
                </p>
              </div>

              <div className="landing-panel p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">What this prevents</p>
                <Separator className="my-4 bg-slate-200" />
                <div className="space-y-4 text-sm leading-7 text-slate-600">
                  <p>Random users joining dorm data they should not see.</p>
                  <p>Room assignment drifting away from billing records.</p>
                  <p>Meal counts being guessed instead of calculated from stored choices.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {workflowSteps.map(({ step, icon: Icon, title, description }) => (
                <div
                  key={step}
                  className="group rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold tracking-[0.24em] text-slate-400">{step}</span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 transition-colors group-hover:bg-slate-950 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-6 font-display text-2xl text-slate-950">{title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="container py-20">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Core capabilities</p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Designed for the actual daily load.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              The product should feel dependable in the middle of a billing cycle, a room change,
              or a kitchen prep window. These features are organized around that reality.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, description, accent }) => (
              <div
                key={title}
                className={`rounded-[30px] border border-white/70 bg-gradient-to-br ${accent} p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-2xl text-slate-950">{title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-700">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container py-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
            <div className="landing-panel overflow-hidden p-0">
              <div className="grid gap-0 md:grid-cols-[0.92fr_1.08fr]">
                <div className="bg-slate-950 px-8 py-10 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
                    Multi-location landlord view
                  </p>
                  <h2 className="mt-4 font-display text-4xl">
                    A clean way to scale from one building to many.
                  </h2>
                  <p className="mt-4 text-base leading-7 text-white/75">
                    The right architecture is not one giant shared dashboard. It is one account,
                    multiple memberships, and one active dorm context when real work happens.
                  </p>
                </div>

                <div className="space-y-4 bg-white px-6 py-6 sm:px-8">
                  {[
                    { name: "Central Riverside Dorm", status: "Active landlord workspace", detail: "46 rooms • monthly billing" },
                    { name: "North Campus Residence", status: "Chef invited and meals live", detail: "32 rooms • dinner cutoff 20:00" },
                    { name: "Airport Road Annex", status: "Invoices generated this month", detail: "18 rooms • 4 payments pending" },
                  ].map((workspace, index) => (
                    <div
                      key={workspace.name}
                      className={`rounded-[24px] border p-5 ${
                        index === 0
                          ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_38px_rgba(15,23,42,0.18)]"
                          : "border-slate-200 bg-slate-50 text-slate-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{workspace.name}</p>
                          <p className={`mt-1 text-sm ${index === 0 ? "text-white/75" : "text-slate-500"}`}>
                            {workspace.detail}
                          </p>
                        </div>
                        <Badge
                          variant={index === 0 ? "secondary" : "outline"}
                          className={`rounded-full ${
                            index === 0
                              ? "border-white/10 bg-white/10 text-white hover:bg-white/10"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {workspace.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-slate-950 px-8 py-10 text-white shadow-[0_28px_70px_rgba(15,23,42,0.18)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">Why buyers care</p>
              <h2 className="mt-4 font-display text-4xl">The system rewards clean operations.</h2>
              <div className="mt-8 space-y-5">
                {[
                  "Invite-driven membership keeps the dorm private and controlled.",
                  "Room, meal, invoice, and maintenance records all stay tied to the right membership.",
                  "Switching between dorms is simple because authorization is already modeled correctly.",
                ].map((item) => (
                  <div key={item} className="flex gap-3">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-400/15 text-sky-200">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-base leading-7 text-white/80">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="container py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Frequently asked</p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Clear rules make the product easier to trust.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                The most important questions are usually about who controls what, and whether the
                model still works once a landlord operates multiple dorms.
              </p>
            </div>

            <div className="landing-panel space-y-4 px-6 py-6 sm:px-8">
              {faqs.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-[24px] border border-slate-200 bg-white px-5 py-4"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-slate-950">
                    <span>{item.question}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pt-4 text-base leading-7 text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="container pb-24 pt-6">
          <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-slate-950 px-8 py-10 text-white shadow-[0_30px_80px_rgba(15,23,42,0.2)] sm:px-12 sm:py-14">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">Ready to start</p>
                <h2 className="mt-4 font-display text-4xl sm:text-5xl">
                  Build a dorm operation that feels organized from day one.
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">
                  Start as landlord, create the first workspace, then invite tenants and chefs into
                  a system that already understands how the dorm should run.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Button
                  asChild
                  size="lg"
                  className="h-[54px] rounded-full bg-white px-7 text-base text-slate-950 hover:bg-slate-100"
                >
                  <Link to="/register">
                    Create workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-[54px] rounded-full border-white/20 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/70 py-8 backdrop-blur">
        <div className="container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl text-slate-950">DormFlow</p>
            <p className="text-sm text-slate-500">
              Private dorm operations for landlords, tenants, and chefs.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500">
            <a href="#features" className="transition-colors hover:text-slate-900">
              Features
            </a>
            <a href="#workflow" className="transition-colors hover:text-slate-900">
              Workflow
            </a>
            <Link to="/login" className="transition-colors hover:text-slate-900">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
