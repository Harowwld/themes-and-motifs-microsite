"use client";

import { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import { Globe, Heart, Users, Award, Save, Plus, Trash2, ArrowUp, ArrowDown, Camera, Settings } from "lucide-react";
import { ImageUploadDropzone } from "@/components/ImageUploadDropzone";

type EntourageMember = {
  name: string;
  role: string;
  side: string;
  color?: string;
  photo_url?: string;
};

const COLOR_PRESETS = [
  { id: "rose", name: "Rose (Bride)", bgColor: "bg-rose-50", borderColor: "border-rose-200", dotColor: "bg-rose-500", textColor: "text-rose-600" },
  { id: "blue", name: "Blue (Groom)", bgColor: "bg-blue-50", borderColor: "border-blue-200", dotColor: "bg-blue-500", textColor: "text-blue-600" },
  { id: "amber", name: "Gold", bgColor: "bg-amber-50", borderColor: "border-amber-200", dotColor: "bg-amber-500", textColor: "text-amber-700" },
  { id: "emerald", name: "Emerald", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", dotColor: "bg-emerald-500", textColor: "text-emerald-700" },
  { id: "purple", name: "Purple", bgColor: "bg-purple-50", borderColor: "border-purple-200", dotColor: "bg-purple-500", textColor: "text-purple-700" },
  { id: "indigo", name: "Indigo", bgColor: "bg-indigo-50", borderColor: "border-indigo-200", dotColor: "bg-indigo-500", textColor: "text-indigo-700" },
  { id: "neutral", name: "Gray", bgColor: "bg-neutral-100", borderColor: "border-neutral-200", dotColor: "bg-neutral-500", textColor: "text-neutral-600" },
];

const getTagColorClass = (color?: string, side?: string) => {
  if (color) {
    const preset = COLOR_PRESETS.find(p => p.id === color);
    if (preset) {
      return `${preset.bgColor} ${preset.textColor} border ${preset.borderColor}`;
    }
  }

  // Fallback to side-based matching
  const lowerSide = (side || "").toLowerCase();
  if (lowerSide === "bride" || lowerSide === "bride's side") {
    return "bg-rose-50 text-rose-600 border border-rose-100";
  }
  if (lowerSide === "groom" || lowerSide === "groom's side") {
    return "bg-blue-50 text-blue-600 border border-blue-100";
  }
  return "bg-neutral-100 text-neutral-500 border border-neutral-200/40";
};

type Sponsor = {
  name: string;
  role: string;
  side: string;
  color?: string;
  photo_url?: string;
  type: "principal" | "secondary";
};

type MicrositeSettingsProps = {
  user: any;
  supabase: any;
};

export default function MicrositeSettings({ user, supabase }: MicrositeSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [ourStoryText, setOurStoryText] = useState("");
  const [ourMessage, setOurMessage] = useState("");
  const [entourage, setEntourage] = useState<EntourageMember[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  // Newly wired fields
  // Newly wired fields
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [brideNickname, setBrideNickname] = useState("");
  const [brideLastName, setBrideLastName] = useState("");
  const [groomNickname, setGroomNickname] = useState("");
  const [groomLastName, setGroomLastName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [weddingTime, setWeddingTime] = useState("");
  const [weddingDatePublic, setWeddingDatePublic] = useState(false);
  const [weddingVenueArea, setWeddingVenueArea] = useState("");
  const [weddingVenuePublic, setWeddingVenuePublic] = useState(false);
  const [location, setLocation] = useState("");
  const [profileVisibility, setProfileVisibility] = useState<"public" | "private">("private");

  // Local state for adding new entourage member
  const [newMember, setNewMember] = useState<EntourageMember>({
    name: "",
    role: "",
    side: "",
    color: "",
    photo_url: "",
  });

  // Local state for adding new sponsor
  const [newSponsor, setNewSponsor] = useState<Sponsor>({
    name: "",
    role: "",
    side: "",
    color: "",
    photo_url: "",
    type: "principal",
  });

  // Load current values from the database
  useEffect(() => {
    async function loadSettings() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("soon_to_wed_profiles")
          .select("our_story_text, entourage, sponsors, our_message, profile_photo_url, bride_nickname, bride_last_name, groom_nickname, groom_last_name, wedding_date, wedding_time, wedding_date_public, wedding_venue_area, wedding_venue_public, location, profile_visibility")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setOurStoryText(data.our_story_text || "");
          setOurMessage(data.our_message || "");
          setProfilePhotoUrl(data.profile_photo_url || "");
          setBrideNickname(data.bride_nickname || "");
          setBrideLastName(data.bride_last_name || "");
          setGroomNickname(data.groom_nickname || "");
          setGroomLastName(data.groom_last_name || "");
          setWeddingDate(data.wedding_date || "");
          setWeddingTime(data.wedding_time || "");
          setWeddingDatePublic(!!data.wedding_date_public);
          setWeddingVenueArea(data.wedding_venue_area || "");
          setWeddingVenuePublic(!!data.wedding_venue_public);
          setLocation(data.location || "");
          setProfileVisibility(data.profile_visibility === "public" ? "public" : "private");
          
          if (data.entourage && Array.isArray(data.entourage)) {
            setEntourage(data.entourage as EntourageMember[]);
          } else {
            setEntourage([]);
          }

          if (data.sponsors && Array.isArray(data.sponsors)) {
            setSponsors(data.sponsors as Sponsor[]);
          } else {
            setSponsors([]);
          }
        }
      } catch (err) {
        console.error("Error loading wedding page settings:", err);
        toast.error("Failed to load your wedding page configuration.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [user?.id, supabase]);

  // Save changes to database
  const handleSave = async () => {
    if (!user?.id) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from("soon_to_wed_profiles")
        .upsert({
          user_id: user.id,
          our_story_text: ourStoryText,
          our_message: ourMessage,
          entourage: entourage,
          sponsors: sponsors,
          profile_photo_url: profilePhotoUrl || null,
          bride_nickname: brideNickname || null,
          bride_last_name: brideLastName || null,
          groom_nickname: groomNickname || null,
          groom_last_name: groomLastName || null,
          wedding_date: weddingDate || null,
          wedding_time: weddingTime || null,
          wedding_date_public: weddingDatePublic,
          wedding_venue_area: weddingVenueArea || null,
          wedding_venue_public: weddingVenuePublic,
          location: location || null,
          profile_visibility: profileVisibility,
        }, { onConflict: "user_id" });

      if (error) throw error;
      toast.success("✨ Wedding page settings updated successfully!");
    } catch (err) {
      console.error("Error saving wedding page settings:", err);
      toast.error("Failed to save wedding page settings.");
    } finally {
      setSaving(false);
    }
  };

  // Add entourage member
  const handleAddMember = () => {
    if (!newMember.name.trim() || !newMember.role.trim()) {
      toast.error("Please enter a name and role for the entourage member.");
      return;
    }
    setEntourage((prev) => [...prev, { ...newMember }]);
    setNewMember({ name: "", role: "", side: "", color: "", photo_url: "" });
  };

  // Remove entourage member
  const handleRemoveMember = (idx: number) => {
    setEntourage((prev) => prev.filter((_, i) => i !== idx));
  };

  // Move entourage member up/down
  const handleMoveMember = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === entourage.length - 1) return;

    const nextIdx = direction === "up" ? idx - 1 : idx + 1;
    const newEntourage = [...entourage];
    const temp = newEntourage[idx];
    newEntourage[idx] = newEntourage[nextIdx];
    newEntourage[nextIdx] = temp;
    setEntourage(newEntourage);
  };

  // Add sponsor
  const handleAddSponsor = () => {
    if (!newSponsor.name.trim()) {
      toast.error("Please enter a name for the sponsor.");
      return;
    }
    setSponsors((prev) => [...prev, { ...newSponsor }]);
    setNewSponsor({ name: "", role: "", side: "", color: "", photo_url: "", type: "principal" });
  };

  // Remove sponsor
  const handleRemoveSponsor = (idx: number) => {
    setSponsors((prev) => prev.filter((_, i) => i !== idx));
  };

  // Move sponsor up/down
  const handleMoveSponsor = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === sponsors.length - 1) return;

    const nextIdx = direction === "up" ? idx - 1 : idx + 1;
    const newSponsors = [...sponsors];
    const temp = newSponsors[idx];
    newSponsors[idx] = newSponsors[nextIdx];
    newSponsors[nextIdx] = temp;
    setSponsors(newSponsors);
  };

  if (loading) {
    return (
      <div className="bg-white border border-black/[0.06] rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a68b6a]"></div>
        <p className="text-neutral-400 text-sm mt-4 font-medium font-[family-name:var(--font-plus-jakarta)]">Loading microsite customizer...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header section with quick preview button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-black/[0.05] rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-[#a68b6a]/10 flex items-center justify-center text-[#a68b6a] shrink-0">
            <Globe size={20} className="stroke-[2]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#2c2c2c] font-[family-name:var(--font-noto-serif)]">
              Wedding Page Settings & Customizer
            </h2>
            <p className="text-[12px] text-neutral-500 font-[family-name:var(--font-plus-jakarta)] mt-0.5">
              Personalize the public wedding page your guests will see. Configure your story, entourage list, sponsors, and custom welcome letter.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#a68b6a] text-white text-[12px] font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg hover:bg-[#957a5c] transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 font-[family-name:var(--font-plus-jakarta)]"
        >
          <Save size={14} className="stroke-[2.5]" />
          {saving ? "Saving Changes..." : "Save Configuration"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Love Story & Guest Welcome Letter */}
        <div className="space-y-8">
          
          {/* Section: Microsite Cover & General Settings */}
          <div className="bg-white border border-black/[0.05] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-black/[0.04] pb-3 mb-2">
              <Settings size={16} className="text-[#a68b6a]" />
              <h3 className="text-[14px] font-bold text-[#2c2c2c] uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)]">
                General Microsite Info & Cover
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase text-neutral-400 mb-1 font-[family-name:var(--font-plus-jakarta)]">
                  Microsite Cover Photo
                </span>
                <ImageUploadDropzone
                  bucket="user-assets"
                  folder="profiles"
                  entityId={user?.id}
                  label=""
                  description="Drag and drop or click to select your wedding cover background photo. JPG, PNG, WebP up to 2MB."
                  onUploadComplete={(res) => setProfilePhotoUrl(res.url)}
                  existingUrl={profilePhotoUrl}
                  onClear={() => setProfilePhotoUrl("")}
                />
                <p className="text-[10px] text-neutral-400 mt-1 font-[family-name:var(--font-plus-jakarta)]">
                  Leave blank to use our gorgeous default high-resolution wedding cover background.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5 font-[family-name:var(--font-plus-jakarta)]">
                    Bride Nickname / First Name
                  </label>
                  <input
                    type="text"
                    value={brideNickname}
                    onChange={(e) => setBrideNickname(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50/30 rounded-xl text-[13px] text-neutral-700 font-[family-name:var(--font-plus-jakarta)] focus:outline-none focus:ring-1 focus:ring-[#a68b6a] focus:bg-white transition-all"
                    placeholder="e.g. Jen"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5 font-[family-name:var(--font-plus-jakarta)]">
                    Bride Last Name
                  </label>
                  <input
                    type="text"
                    value={brideLastName}
                    onChange={(e) => setBrideLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50/30 rounded-xl text-[13px] text-neutral-700 font-[family-name:var(--font-plus-jakarta)] focus:outline-none focus:ring-1 focus:ring-[#a68b6a] focus:bg-white transition-all"
                    placeholder="e.g. Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5 font-[family-name:var(--font-plus-jakarta)]">
                    Groom Nickname / First Name
                  </label>
                  <input
                    type="text"
                    value={groomNickname}
                    onChange={(e) => setGroomNickname(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50/30 rounded-xl text-[13px] text-neutral-700 font-[family-name:var(--font-plus-jakarta)] focus:outline-none focus:ring-1 focus:ring-[#a68b6a] focus:bg-white transition-all"
                    placeholder="e.g. Mark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5 font-[family-name:var(--font-plus-jakarta)]">
                    Groom Last Name
                  </label>
                  <input
                    type="text"
                    value={groomLastName}
                    onChange={(e) => setGroomLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50/30 rounded-xl text-[13px] text-neutral-700 font-[family-name:var(--font-plus-jakarta)] focus:outline-none focus:ring-1 focus:ring-[#a68b6a] focus:bg-white transition-all"
                    placeholder="e.g. Miller"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5 font-[family-name:var(--font-plus-jakarta)]">
                    Wedding Date
                  </label>
                  <input
                    type="date"
                    value={weddingDate ? weddingDate.split("T")[0] : ""}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50/30 rounded-xl text-[13px] text-neutral-700 font-[family-name:var(--font-plus-jakarta)] focus:outline-none focus:ring-1 focus:ring-[#a68b6a] focus:bg-white transition-all"
                  />
                  <div className="mt-3">
                    <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5 font-[family-name:var(--font-plus-jakarta)]">
                      Wedding Time
                    </label>
                    <input
                      type="time"
                      value={weddingTime}
                      onChange={(e) => setWeddingTime(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50/30 rounded-xl text-[13px] text-neutral-700 font-[family-name:var(--font-plus-jakarta)] focus:outline-none focus:ring-1 focus:ring-[#a68b6a] focus:bg-white transition-all"
                    />
                  </div>
                  <label className="flex items-center gap-2 mt-2 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={weddingDatePublic}
                      onChange={(e) => setWeddingDatePublic(e.target.checked)}
                      className="rounded text-[#a68b6a] focus:ring-[#a68b6a] border-neutral-300"
                    />
                    <span className="text-[11px] text-neutral-500 font-semibold font-[family-name:var(--font-plus-jakarta)]">Make wedding date public</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5 font-[family-name:var(--font-plus-jakarta)]">
                    Ceremony Area / Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50/30 rounded-xl text-[13px] text-neutral-700 font-[family-name:var(--font-plus-jakarta)] focus:outline-none focus:ring-1 focus:ring-[#a68b6a] focus:bg-white transition-all"
                    placeholder="e.g. Peoria, Illinois"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5 font-[family-name:var(--font-plus-jakarta)]">
                    Wedding Venue
                  </label>
                  <input
                    type="text"
                    value={weddingVenueArea}
                    onChange={(e) => setWeddingVenueArea(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50/30 rounded-xl text-[13px] text-neutral-700 font-[family-name:var(--font-plus-jakarta)] focus:outline-none focus:ring-1 focus:ring-[#a68b6a] focus:bg-white transition-all"
                    placeholder="e.g. St. Jude Cathedral"
                  />
                  <label className="flex items-center gap-2 mt-2 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={weddingVenuePublic}
                      onChange={(e) => setWeddingVenuePublic(e.target.checked)}
                      className="rounded text-[#a68b6a] focus:ring-[#a68b6a] border-neutral-300"
                    />
                    <span className="text-[11px] text-neutral-500 font-semibold font-[family-name:var(--font-plus-jakarta)]">Make wedding venue public</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5 font-[family-name:var(--font-plus-jakarta)]">
                    Microsite Page Visibility
                  </label>
                  <select
                    value={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50/30 rounded-xl text-[13px] text-neutral-700 font-[family-name:var(--font-plus-jakarta)] focus:outline-none focus:ring-1 focus:ring-[#a68b6a] focus:bg-white transition-all"
                  >
                    <option value="private">Private (Only you can access)</option>
                    <option value="public">Public (Visible in public Couples Feed)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section: Our Love Story */}
          <div className="bg-white border border-black/[0.05] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-black/[0.04] pb-3 mb-2">
              <Heart size={16} className="text-[#a68b6a]" />
              <h3 className="text-[14px] font-bold text-[#2c2c2c] uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)]">
                Our Love Story Narrative
              </h3>
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5 font-[family-name:var(--font-plus-jakarta)]">
                Narrative Text
              </label>
              <textarea
                value={ourStoryText}
                onChange={(e) => setOurStoryText(e.target.value)}
                rows={8}
                className="w-full px-3 py-2.5 border border-neutral-200 bg-neutral-50/30 rounded-xl text-[13px] text-neutral-700 leading-relaxed font-[family-name:var(--font-plus-jakarta)] focus:outline-none focus:ring-1 focus:ring-[#a68b6a] focus:bg-white transition-all"
                placeholder="Write your beautiful love story here. Describe how you met, your journey together, and the proposal..."
              />
              <p className="text-[11px] text-neutral-400 italic mt-1.5 font-[family-name:var(--font-plus-jakarta)]">
                Supports multiple paragraph spaces. Leave blank to display the default elegant template.
              </p>
            </div>
          </div>

          {/* Section: A Letter to Our Guests */}
          <div className="bg-white border border-black/[0.05] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-black/[0.04] pb-3 mb-2">
              <Globe size={16} className="text-[#a68b6a]" />
              <h3 className="text-[14px] font-bold text-[#2c2c2c] uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)]">
                Guest Welcome Message
              </h3>
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5 font-[family-name:var(--font-plus-jakarta)]">
                Welcome Letter
              </label>
              <textarea
                value={ourMessage}
                onChange={(e) => setOurMessage(e.target.value)}
                rows={8}
                className="w-full px-3 py-2.5 border border-neutral-200 bg-neutral-50/30 rounded-xl text-[13px] text-neutral-700 leading-relaxed font-[family-name:var(--font-plus-jakarta)] focus:outline-none focus:ring-1 focus:ring-[#a68b6a] focus:bg-white transition-all"
                placeholder="Dear Family and Friends, we are incredibly blessed to have you in our lives..."
              />
              <p className="text-[11px] text-neutral-400 italic mt-1.5 font-[family-name:var(--font-plus-jakarta)]">
                This message displays inside the 'Our Message' tab as an elegant letter. Leave blank to use the default welcome letter template.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Entourage Party & Sponsors Directory */}
        <div className="space-y-8">
          
          {/* Section: Entourage Party Builder */}
          <div className="bg-white border border-black/[0.05] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-black/[0.04] pb-3 mb-2">
              <Users size={16} className="text-[#a68b6a]" />
              <h3 className="text-[14px] font-bold text-[#2c2c2c] uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)]">
                Entourage Party Builder
              </h3>
            </div>

            {/* Form to Add Member */}
            <div className="bg-neutral-50/40 p-4 rounded-xl border border-black/[0.03] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-semibold text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#a68b6a]"
                    placeholder="e.g. Clara Bennett"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-semibold text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#a68b6a]"
                    placeholder="e.g. Maid of Honor"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Affiliation / Side</label>
                  <input
                    type="text"
                    value={newMember.side}
                    onChange={(e) => setNewMember({ ...newMember, side: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-semibold text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#a68b6a]"
                    placeholder="e.g. Bride's side"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Photo (Optional)</label>
                  <ImageUploadDropzone
                    bucket="user-assets"
                    folder="entourage"
                    entityId={user?.id}
                    label=""
                    description="Upload member photo"
                    onUploadComplete={(res) => setNewMember({ ...newMember, photo_url: res.url })}
                    existingUrl={newMember.photo_url}
                    onClear={() => setNewMember({ ...newMember, photo_url: "" })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="block text-[11px] font-bold uppercase text-neutral-400">Tag Color Choice</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setNewMember({ ...newMember, color: preset.id })}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${preset.bgColor} ${preset.borderColor} ${
                        newMember.color === preset.id || (!newMember.color && preset.id === "neutral")
                          ? "ring-2 ring-offset-1 ring-[#a68b6a] scale-110"
                          : "hover:scale-105"
                      }`}
                      title={preset.name}
                    >
                      <span className={`w-2 h-2 rounded-full ${preset.dotColor}`} />
                    </button>
                  ))}
                  <span className="text-[10px] text-neutral-400 ml-1 italic font-semibold font-[family-name:var(--font-plus-jakarta)]">
                    {newMember.color ? COLOR_PRESETS.find(p => p.id === newMember.color)?.name : "Default (Auto-matched)"}
                  </span>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#a68b6a] hover:bg-[#957a5c] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus size={12} className="stroke-[2.5]" /> Add Member
                </button>
              </div>
            </div>

            {/* List of current entourage party */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {entourage.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4 italic">No custom entourage members added yet. Default entourage will display.</p>
              ) : (
                entourage.map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#fafafa] border border-black/[0.03] rounded-xl hover:border-neutral-200 transition-all select-none">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-700 text-xs truncate">{member.name}</span>
                        {member.side && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            getTagColorClass(member.color, member.side)
                          }`}>
                            {member.side}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{member.role}</p>
                      
                      {/* Photo Thumbnail */}
                      {member.photo_url && (
                        <div className="mt-1.5">
                          <img src={member.photo_url} alt="Entourage" className="h-8 w-8 rounded-full object-cover border border-black/5" />
                        </div>
                      )}

                      {/* Inline color editor */}
                      <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-black/[0.02]">
                        <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)]">Color:</span>
                        <div className="flex gap-1">
                          {COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                const updated = [...entourage];
                                updated[idx] = { ...member, color: preset.id };
                                setEntourage(updated);
                              }}
                              className={`w-3.5 h-3.5 rounded-full border transition-all ${preset.bgColor} ${preset.borderColor} ${
                                member.color === preset.id || (!member.color && preset.id === "neutral")
                                  ? "ring-1 ring-offset-0.5 ring-[#a68b6a] scale-110"
                                  : "hover:scale-105"
                              }`}
                              title={preset.name}
                            >
                              <span className={`w-1 h-1 rounded-full opacity-60 ${preset.dotColor}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveMember(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 rounded disabled:opacity-30 cursor-pointer transition-colors"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveMember(idx, "down")}
                        disabled={idx === entourage.length - 1}
                        className="p-1 hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 rounded disabled:opacity-30 cursor-pointer transition-colors"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Sponsors Directory Builder */}
          <div className="bg-white border border-black/[0.05] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-black/[0.04] pb-3 mb-2">
              <Award size={16} className="text-[#a68b6a]" />
              <h3 className="text-[14px] font-bold text-[#2c2c2c] uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)]">
                Sponsors Directory Builder
              </h3>
            </div>

            <div className="bg-neutral-50/40 p-4 rounded-xl border border-black/[0.03] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={newSponsor.name}
                    onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-semibold text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#a68b6a]"
                    placeholder="e.g. Mr. Edward Harrison"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={newSponsor.role}
                    onChange={(e) => setNewSponsor({ ...newSponsor, role: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-semibold text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#a68b6a]"
                    placeholder="e.g. Ninong / Principal Sponsor"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Affiliation / Side</label>
                  <input
                    type="text"
                    value={newSponsor.side}
                    onChange={(e) => setNewSponsor({ ...newSponsor, side: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-semibold text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#a68b6a]"
                    placeholder="e.g. Bride's side"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Sponsor Category</label>
                  <select
                    value={newSponsor.type}
                    onChange={(e) => setNewSponsor({ ...newSponsor, type: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-semibold text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#a68b6a]"
                  >
                    <option value="principal">Principal Sponsor</option>
                    <option value="secondary">Secondary Sponsor</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Photo (Optional)</label>
                  <ImageUploadDropzone
                    bucket="user-assets"
                    folder="sponsors"
                    entityId={user?.id}
                    label=""
                    description="Upload sponsor photo"
                    onUploadComplete={(res) => setNewSponsor({ ...newSponsor, photo_url: res.url })}
                    existingUrl={newSponsor.photo_url}
                    onClear={() => setNewSponsor({ ...newSponsor, photo_url: "" })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="block text-[11px] font-bold uppercase text-neutral-400">Tag Color Choice</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setNewSponsor({ ...newSponsor, color: preset.id })}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${preset.bgColor} ${preset.borderColor} ${
                        newSponsor.color === preset.id || (!newSponsor.color && preset.id === "neutral")
                          ? "ring-2 ring-offset-1 ring-[#a68b6a] scale-110"
                          : "hover:scale-105"
                      }`}
                      title={preset.name}
                    >
                      <span className={`w-2 h-2 rounded-full ${preset.dotColor}`} />
                    </button>
                  ))}
                  <span className="text-[10px] text-neutral-400 ml-1 italic font-semibold font-[family-name:var(--font-plus-jakarta)]">
                    {newSponsor.color ? COLOR_PRESETS.find(p => p.id === newSponsor.color)?.name : "Default (Auto-matched)"}
                  </span>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddSponsor}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#a68b6a] hover:bg-[#957a5c] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus size={12} className="stroke-[2.5]" /> Add Sponsor
                </button>
              </div>
            </div>

            {/* List of current sponsors */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {sponsors.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4 italic">No custom sponsors added yet. Default sponsors list will display.</p>
              ) : (
                sponsors.map((sponsor, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#fafafa] border border-black/[0.03] rounded-xl hover:border-neutral-200 transition-all select-none">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-700 text-xs truncate">{sponsor.name}</span>
                        {sponsor.side && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            getTagColorClass(sponsor.color, sponsor.side)
                          }`}>
                            {sponsor.side}
                          </span>
                        )}
                        <span className={`ml-2 text-[8px] px-1 rounded font-bold uppercase tracking-wider ${
                          sponsor.type === "principal" ? "bg-amber-50 text-amber-700 border border-amber-200/40" : "bg-neutral-100 text-neutral-600"
                        }`}>
                          {sponsor.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{sponsor.role}</p>

                      {/* Photo Thumbnail */}
                      {sponsor.photo_url && (
                        <div className="mt-1.5">
                          <img src={sponsor.photo_url} alt="Sponsor" className="h-8 w-8 rounded-full object-cover border border-black/5" />
                        </div>
                      )}

                      {/* Inline color editor */}
                      <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-black/[0.02]">
                        <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider font-[family-name:var(--font-plus-jakarta)]">Color:</span>
                        <div className="flex gap-1">
                          {COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                const updated = [...sponsors];
                                updated[idx] = { ...sponsor, color: preset.id };
                                setSponsors(updated);
                              }}
                              className={`w-3.5 h-3.5 rounded-full border transition-all ${preset.bgColor} ${preset.borderColor} ${
                                sponsor.color === preset.id || (!sponsor.color && preset.id === "neutral")
                                  ? "ring-1 ring-offset-0.5 ring-[#a68b6a] scale-110"
                                  : "hover:scale-105"
                              }`}
                              title={preset.name}
                            >
                              <span className={`w-1 h-1 rounded-full opacity-60 ${preset.dotColor}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveSponsor(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 rounded disabled:opacity-30 cursor-pointer transition-colors"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSponsor(idx, "down")}
                        disabled={idx === sponsors.length - 1}
                        className="p-1 hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 rounded disabled:opacity-30 cursor-pointer transition-colors"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSponsor(idx)}
                        className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Floating Save Banner */}
      <div className="flex justify-end pt-4 select-none">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#a68b6a] text-white text-[13px] font-bold uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl hover:bg-[#957a5c] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-plus-jakarta)]"
        >
          <Save size={15} className="stroke-[2.5]" />
          {saving ? "Saving Changes..." : "Save Microsite Configuration"}
        </button>
      </div>

    </div>
  );
}
