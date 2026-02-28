type SidebarUser = {
  id: string;
  name: string | null;
  email: string;
  role: "FREE" | "PREMIUM";
  credits: number;
  isPremium: boolean;
};

export default function Sidebar({
  user,
  onUpgrade,
}: {
  user?: SidebarUser;
  onUpgrade?: () => void;
}) {
  const safeUser: SidebarUser = user ?? {
    id: "guest",
    name: "Guest",
    email: "guest@example.com",
    role: "FREE",
    credits: 1,
    isPremium: false,
  };

  const menuItems = [
    // existing menu items
  ];

  return (
    <aside>
      {/* use safeUser */}
    </aside>
  );
}
