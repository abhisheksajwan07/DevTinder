import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  avatarIdsByLabel,
  skillIdsByName,
  interestIdsByName,
  lookingForIdsByName,
  type Role,
  type Experience,
  type Availability,
  type CollabGoal,
} from "../mock-data";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

import ProgressBar from "../../components/onboarding/ProgressBar";
import Step1BasicProfile from "../../components/onboarding/Step1BasicProfile";
import Step2DeveloperIdentity from "../../components/onboarding/Step2DeveloperIdentity";
import Step3Skills from "../../components/onboarding/Step3Skills";
import Step4Interests from "../../components/onboarding/Step4Interests";
import Step5Goals from "../../components/onboarding/Step5Goals";
import Step6GithubConnection from "../../components/onboarding/Step6GithubConnection";

const TOTAL_STEPS = 6;

const roleApiValues: Record<Role, string> = {
  Frontend: "frontend",
  Backend: "backend",
  Fullstack: "fullstack",
  Mobile: "mobile",
  DevOps: "devops",
  "Machine Learning": "ml",
  Data: "data",
  Designer: "designer",
  Product: "product",
};

const availabilityApiValues: Record<Availability, string> = {
  "1–5 hrs/week": "1_5_hours",
  "5–15 hrs/week": "5_15_hours",
  "15–30 hrs/week": "15_30_hours",
  "Full-time": "full_time",
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1: Basic Profile
  const [firstName, setFirstName] = useState("Abhishek");
  const [lastName, setLastName] = useState("Sajwan");
  const [username, setUsername] = useState("abhishekbuilds");
  const [bio, setBio] = useState(
    "Building tools that help developers find the right people to build with."
  );
  const [selectedAvatar, setSelectedAvatar] = useState("AB");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(true);

  // Step 2: Developer Identity
  const [selectedRole, setSelectedRole] = useState<Role | null>("Backend");
  const [selectedExp, setSelectedExp] = useState<Experience | null>("Senior");
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>("5–15 hrs/week");

  // Step 3: Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["TypeScript", "Node.js", "PostgreSQL"]);
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");

  // Step 4: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Open source", "SaaS", "AI tools"]);

  // Step 5: Collaboration Goals
  const [selectedGoals, setSelectedGoals] = useState<CollabGoal[]>(["Build a side project"]);
  const [projectDescription, setProjectDescription] = useState(
    "DevTinder — a developer matching platform powered by Voyage AI and pgvector."
  );

  const toggleSkill = (skill: string) => {
    const totalSkills = selectedSkills.length + customSkills.length;
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : totalSkills < 10
        ? [...prev, skill]
        : prev
    );
  };

  const addCustomSkill = () => {
    const skill = customSkillInput.trim();
    if (!skill || customSkills.includes(skill) || selectedSkills.includes(skill)) return;
    if (selectedSkills.length + customSkills.length >= 10) return;
    setCustomSkills((prev) => [...prev, skill]);
    setCustomSkillInput("");
  };

  const removeCustomSkill = (skill: string) => {
    setCustomSkills((prev) => prev.filter((item) => item !== skill));
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleGoal = (goal: CollabGoal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    setUsernameAvailable(val.length > 3 ? val !== "taken_username" : null);
  };

  const canContinue = () => {
    if (step === 1) return firstName && lastName && username && selectedAvatar;
    if (step === 2) return selectedRole && selectedExp && selectedAvailability;
    if (step === 3) return selectedSkills.length + customSkills.length > 0;
    if (step === 4) return selectedInterests.length > 0;
    if (step === 5) return selectedGoals.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#f5f2eb] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-[560px]">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-8">
          <div className="grid size-8 place-items-center rounded-xl bg-[#ee7100] text-white shadow-sm shadow-orange-500/30">
            <img src="/dev-tinder.svg" alt="DevTinder" className="size-4.5" />
          </div>
          <span className="text-base font-bold text-[#242322]">DevTinder</span>
        </div>

        <div className="bg-white rounded-[28px] border border-[#e9e5df] shadow-sm p-7 sm:p-9">
          <ProgressBar step={step} totalSteps={TOTAL_STEPS} />

          {step === 1 && (
            <Step1BasicProfile
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={setSelectedAvatar}
              bio={bio}
              setBio={setBio}
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              username={username}
              handleUsernameChange={handleUsernameChange}
              usernameAvailable={usernameAvailable}
            />
          )}

          {step === 2 && (
            <Step2DeveloperIdentity
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              selectedExp={selectedExp}
              setSelectedExp={setSelectedExp}
              selectedAvailability={selectedAvailability}
              setSelectedAvailability={setSelectedAvailability}
            />
          )}

          {step === 3 && (
            <Step3Skills
              selectedSkills={selectedSkills}
              toggleSkill={toggleSkill}
              customSkills={customSkills}
              removeCustomSkill={removeCustomSkill}
              customSkillInput={customSkillInput}
              setCustomSkillInput={setCustomSkillInput}
              addCustomSkill={addCustomSkill}
            />
          )}

          {step === 4 && (
            <Step4Interests
              selectedInterests={selectedInterests}
              toggleInterest={toggleInterest}
            />
          )}

          {step === 5 && (
            <Step5Goals
              selectedGoals={selectedGoals}
              toggleGoal={toggleGoal}
              projectDescription={projectDescription}
              setProjectDescription={setProjectDescription}
            />
          )}

          {step === 6 && (
            <Step6GithubConnection
              firstName={firstName}
              lastName={lastName}
              username={username}
              selectedRole={selectedRole}
              selectedExp={selectedExp}
              selectedAvailability={selectedAvailability}
              selectedSkills={[...selectedSkills, ...customSkills]}
            />
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#e2ded6] bg-white px-5 py-3 text-sm font-semibold text-[#55504b] transition hover:border-orange-300 hover:bg-[#faf8f5]"
              >
                <ArrowLeft className="size-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canContinue()}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#1a1918] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50"
              >
                Continue
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const profilePayload = {
                    firstName,
                    lastName,
                    userName: username,
                    bio: bio || undefined,
                    primaryRole: selectedRole ? roleApiValues[selectedRole] : undefined,
                    experienceLevel: selectedExp ?? undefined,
                    availability: selectedAvailability
                      ? availabilityApiValues[selectedAvailability]
                      : undefined,
                    avatarId: avatarIdsByLabel[selectedAvatar],
                    projectDescription: projectDescription || undefined,
                    skillIds: selectedSkills.map((skill) => skillIdsByName[skill]),
                    customSkills,
                    interestIds: selectedInterests.map(
                      (interest) => interestIdsByName[interest]
                    ),
                    lookingForIds: selectedGoals.map(
                      (goal) => lookingForIdsByName[goal]
                    ),
                  };

                  window.sessionStorage.setItem(
                    "devtinder-onboarding-preview",
                    JSON.stringify(profilePayload)
                  );
                  navigate("/app/discover");
                }}
                disabled={!canContinue()}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#ee7100] px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition hover:bg-[#d96500] active:scale-[0.99] disabled:opacity-50"
              >
                <Sparkles className="size-4" />
                Complete Profile
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[10px] text-[#9c958e]">
          DevTinder · Voyage AI Matcher · Your data is always under your control
        </p>
      </div>
    </div>
  );
}
