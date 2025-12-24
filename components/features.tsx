import { Brain, Cloud, Shield, Zap } from "lucide-react"

const features = [
  {
    name: "Lightning Fast Conversion",
    description: "Convert files in seconds with our optimized processing engine.",
    icon: Zap,
  },
  {
    name: "Secure & Private",
    description: "Your files are processed securely and deleted automatically after conversion.",
    icon: Shield,
  },
  {
    name: "Cloud Processing",
    description: "Powerful cloud infrastructure handles conversions without slowing your device.",
    icon: Cloud,
  },
  {
    name: "Smart Format Detection",
    description: "Automatically detects file formats and suggests optimal conversion options.",
    icon: Brain,
  },
]

export default function Features() {
  return (
    <section className="container space-y-16 py-24 md:py-32">
      <div className="mx-auto max-w-[58rem] text-center">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Why Choose ConvertFlow?</h2>
        <p className="mt-4 text-muted-foreground sm:text-lg">
          Experience the fastest and most reliable file conversion service available.
        </p>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
        {features.map((feature) => (
          <div key={feature.name} className="relative overflow-hidden rounded-lg border bg-background p-8">
            <div className="flex items-center gap-4">
              <feature.icon className="h-8 w-8" />
              <h3 className="font-bold">{feature.name}</h3>
            </div>
            <p className="mt-2 text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
