import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-6">
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center mb-8">
          <span className="material-symbols-outlined text-6xl text-white mb-4">
            directions_car
          </span>
          <h2 className="text-3xl font-extrabold font-headline tracking-tighter text-white">
            AirlinCabz
          </h2>
          <p className="text-white/80 font-medium">Create your account</p>
        </div>
        
        <div className="bg-white/10 p-2 rounded-3xl backdrop-blur-md shadow-2xl">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-white shadow-none rounded-2xl",
                headerTitle: "font-headline font-bold text-primary",
                headerSubtitle: "text-slate-500 font-label",
                formButtonPrimary: "bg-primary hover:bg-primary-container text-white font-bold py-3",
                socialButtonsBlockButton: "border-outline-variant py-3 rounded-xl",
                formFieldInput: "rounded-xl py-3 border-outline-variant/60 focus:ring-primary/20",
                footerActionLink: "text-primary hover:text-primary-container font-bold",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
