import { motion } from "framer-motion";

const LiveCVPreview = () => {
  return (
    <div className="relative">
      {/* Scanline effect */}
      <motion.div
        className="absolute w-full h-[2px] bg-primary z-10"
        style={{ boxShadow: "0 0 15px hsl(80 100% 53% / 0.6)" }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      
      {/* CV Document */}
      <article
        className="bg-white text-black p-6 font-mono text-[10px] leading-tight"
        style={{ aspectRatio: "1/1.414", width: "100%" }}
      >
        {/* Header */}
        <div className="border-b-2 border-black pb-3 mb-3">
          <h3 className="font-display text-base font-bold tracking-tight text-black">
            AHMED HASSAN
          </h3>
          <p className="text-[9px] text-neutral-600 mt-0.5">
            Senior Software Engineer · Cairo, Egypt
          </p>
          <p className="text-[8px] text-neutral-500 mt-1">
            ahmed.hassan@email.com · +20 100 XXX XXXX · linkedin.com/in/ahmedhassan
          </p>
        </div>

        {/* Summary */}
        <div className="mb-3">
          <h4 className="font-display text-[9px] font-bold uppercase tracking-widest text-black mb-1">
            Professional Summary
          </h4>
          <p className="text-neutral-700 leading-snug">
            Results-driven software engineer with 7+ years of experience in
            full-stack development, microservices architecture, and team
            leadership across multinational environments.
          </p>
        </div>

        {/* Experience */}
        <div className="mb-3">
          <h4 className="font-display text-[9px] font-bold uppercase tracking-widest text-black mb-1">
            Experience
          </h4>
          <div className="mb-2">
            <div className="flex justify-between">
              <span className="font-bold text-black">Senior Engineer — Vodafone Egypt</span>
              <span className="text-neutral-500">2021 – Present</span>
            </div>
            <ul className="mt-0.5 space-y-0.5 text-neutral-700">
              <li>• Orchestrated migration of legacy monolith to microservices, reducing deployment time by 73%</li>
              <li>• Led cross-functional squad of 8 engineers delivering real-time billing platform</li>
            </ul>
          </div>
          <div className="mb-2">
            <div className="flex justify-between">
              <span className="font-bold text-black">Software Engineer — Valeo Egypt</span>
              <span className="text-neutral-500">2018 – 2021</span>
            </div>
            <ul className="mt-0.5 space-y-0.5 text-neutral-700">
              <li>• Engineered embedded dashboard systems processing 2M+ data points daily</li>
              <li>• Implemented CI/CD pipeline reducing release cycles from 2 weeks to 2 days</li>
            </ul>
          </div>
        </div>

        {/* Education */}
        <div className="mb-3">
          <h4 className="font-display text-[9px] font-bold uppercase tracking-widest text-black mb-1">
            Education
          </h4>
          <div className="flex justify-between">
            <span className="text-black font-bold">BSc Computer Engineering — Cairo University</span>
            <span className="text-neutral-500">2014 – 2018</span>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h4 className="font-display text-[9px] font-bold uppercase tracking-widest text-black mb-1">
            Skills
          </h4>
          <p className="text-neutral-700">
            TypeScript · React · Node.js · Python · AWS · Docker · Kubernetes · PostgreSQL · Redis · GraphQL
          </p>
        </div>
      </article>
    </div>
  );
};

export default LiveCVPreview;
