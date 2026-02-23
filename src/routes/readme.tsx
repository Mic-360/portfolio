import { siteMeta } from '@/lib/site-data'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/readme')({
    head: () => {
        const title = `README | ${siteMeta.defaultTitle}`
        const description = 'Detailed GitHub profile and technical overview.'

        return {
            meta: [
                { title },
                { name: 'description', content: description },
                { property: 'og:title', content: title },
                { property: 'og:description', content: description },
            ],
        }
    },
    component: ReadmePage,
})

function ReadmePage() {
    return (
        <article className="flex flex-col gap-10 pb-20">
            <header className="flex flex-col gap-4">
                <h1 className="text-2xl font-semibold italic">readme.md</h1>
                <hr className="border-border" />
            </header>

            {/* Profile Image and GitHub Stats Section */}
            <section className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="w-1/3 md:w-1/5 shrink-0">
                    <img
                        src="https://raw.githubusercontent.com/Mic-360/Mic-360/main/profile.jpg"
                        alt="Profile"
                        className="w-36 h-36 rounded-full border border-primary shadow-xl"
                    />
                </div>
                <div className="w-full md:w-3/4">
                    <img
                        src="https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=mic-360&theme=transparent"
                        alt="Stats"
                        className="w-full h-auto"
                    />
                </div>
            </section>

            {/* Summary Cards Section */}
            <section className="grid grid-cols-2 gap-4 items-center justify-items-center">
                <img src="https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=mic-360&theme=transparent" alt="Repos per Language" className="w-full h-auto" />
                <img src="https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=mic-360&theme=transparent" alt="Most Commit Language" className="w-full h-auto" />
                <img src="https://github-profile-summary-cards.vercel.app/api/cards/stats?username=mic-360&theme=transparent" alt="Stats" className="w-full h-auto" />
                <img src="https://github-profile-summary-cards.vercel.app/api/cards/productive-time?username=mic-360&theme=transparent&utcOffset=5.30" alt="Productive Time" className="w-full h-auto" />
            </section>

            {/* Metrics Section */}
            <section className="w-full">
                <img
                    src="https://raw.githubusercontent.com/Mic-360/Mic-360/main/github-metrics.svg"
                    alt="Contributions Metrics"
                    className="w-full h-auto"
                />
            </section>

            {/* Languages and Tools Section */}
            <section className="flex flex-col gap-6 text-center">
                <h2 className="text-2xl font-bold">🫤 Languages and Tools</h2>
                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                    {[
                        { src: "nextjs/nextjs-original.svg", alt: "Next.js" },
                        { src: "nodejs/nodejs-original.svg", alt: "Node.js" },
                        { src: "git/git-original.svg", alt: "Git" },
                        { src: "amazonwebservices/amazonwebservices-plain-wordmark.svg", alt: "AWS" },
                        { src: "azuredevops/azuredevops-original.svg", alt: "Azure DevOps" },
                        { src: "cloudflare/cloudflare-original.svg", alt: "Cloudflare" },
                        { src: "cloudflareworkers/cloudflareworkers-original.svg", alt: "Cloudflare Workers" },
                        { src: "typescript/typescript-original.svg", alt: "TypeScript" },
                        { src: "android/android-plain.svg", alt: "Android" },
                        { src: "dart/dart-original.svg", alt: "Dart" },
                        { src: "flutter/flutter-original.svg", alt: "Flutter" },
                        { src: "googlecloud/googlecloud-original.svg", alt: "Google Cloud" },
                        { src: "html5/html5-plain.svg", alt: "HTML5" },
                        { src: "css3/css3-plain.svg", alt: "CSS3" },
                        { src: "python/python-original.svg", alt: "Python" },
                        { src: "ubuntu/ubuntu-original.svg", alt: "Ubuntu" },
                        { src: "java/java-original.svg", alt: "Java" },
                        { src: "csharp/csharp-original.svg", alt: "C#" },
                        { src: "gitlab/gitlab-original.svg", alt: "Gitlab" },
                        { src: "go/go-original.svg", alt: "Go" },
                        { src: "homebrew/homebrew-original.svg", alt: "Homebrew" },
                        { src: "jenkins/jenkins-original.svg", alt: "Jenkins" },
                        { src: "prometheus/prometheus-original.svg", alt: "Prometheus" },
                        { src: "selenium/selenium-original.svg", alt: "Selenium" },
                        { src: "yaml/yaml-original.svg", alt: "YAML" },
                        { src: "rust/rust-original.svg", alt: "Rust" },
                        { src: "terraform/terraform-original.svg", alt: "Terraform" },
                        { src: "unrealengine/unrealengine-original.svg", alt: "Unreal Engine" },
                        { src: "svelte/svelte-original.svg", alt: "Svelte" },
                        { src: "solidjs/solidjs-original.svg", alt: "SolidJS" },
                        { src: "solidity/solidity-original.svg", alt: "Solidity" },
                        { src: "redis/redis-original.svg", alt: "Redis" },
                        { src: "nginx/nginx-original.svg", alt: "Nginx" },
                        { src: "llvm/llvm-original.svg", alt: "LLVM" },
                        { src: "kubernetes/kubernetes-original.svg", alt: "Kubernetes" },
                        { src: "jupyter/jupyter-original-wordmark.svg", alt: "Jupyter" },
                        { src: "ionic/ionic-original.svg", alt: "Ionic" },
                        { src: "grafana/grafana-original.svg", alt: "Grafana" },
                        { src: "graphql/graphql-plain.svg", alt: "GraphQL" },
                        { src: "githubactions/githubactions-original.svg", alt: "GitHub Actions" },
                        { src: "firebase/firebase-original.svg", alt: "Firebase" }
                    ].map(icon => (
                        <img
                            key={icon.alt}
                            src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${icon.src}`}
                            alt={icon.alt}
                            className="w-10 h-10 hover:scale-110 transition-transform"
                        />
                    ))}
                </div>
            </section>

            <hr className="border-border opacity-50" />

            {/* Workspace Section */}
            <section className="flex flex-col gap-4 text-center">
                <h4 className="text-lg font-semibold uppercase tracking-widest">My Workspace</h4>
                <div className="flex flex-wrap justify-center gap-2">
                    <img src="https://img.shields.io/badge/Android%2013-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android" />
                    <img src="https://img.shields.io/badge/asus%20ROG%20Flow-000000?style=for-the-badge&logo=asus&logoColor=white" alt="Asus" />
                    <img src="https://img.shields.io/badge/windows%2011 insider-%230078D6.svg?&style=for-the-badge&logo=windows&logoColor=white" alt="Windows" />
                    <img src="https://img.shields.io/badge/Ubuntu%2024.04-E95420?style=for-the-badge&logo=ubuntu&logoColor=white" alt="Ubuntu" />
                    <img src="https://img.shields.io/badge/AMD%20Ryzen_9_5980HS-ED1C24?style=for-the-badge&logo=amd&logoColor=white" alt="AMD" />
                    <img src="https://img.shields.io/badge/RAM-32GB-%230071C5.svg?&style=for-the-badge&logoColor=white" alt="RAM" />
                    <img src="https://img.shields.io/badge/nvidia-gtx%201650-%2376B900.svg?&style=for-the-badge&logo=nvidia&logoColor=white" alt="Nvidia" />
                    <img src="https://img.shields.io/badge/ios%2026-000000?style=for-the-badge&logo=apple&logoColor=white" alt="iOS" />
                </div>
            </section>

            <hr className="border-border opacity-50" />

            {/* Terminals Section */}
            <section className="flex flex-col gap-4 text-center">
                <h4 className="text-lg font-semibold uppercase tracking-widest">Terminals I'm Familiar With</h4>
                <div className="flex flex-wrap justify-center gap-2">
                    <img src="https://img.shields.io/badge/windows%20terminal-4D4D4D?style=for-the-badge&logo=windows%20terminal&logoColor=white" alt="Windows Terminal" />
                    <img src="https://img.shields.io/badge/powershell-5391FE?style=for-the-badge&logo=powershell&logoColor=white" alt="PowerShell" />
                    <img src="https://img.shields.io/badge/GIT-E44C30?style=for-the-badge&logo=git&logoColor=white" alt="Git" />
                    <img src="https://img.shields.io/badge/GNU%20Bash-4EAA25?style=for-the-badge&logo=GNU%20Bash&logoColor=white" alt="Bash" />
                    <img src="https://img.shields.io/badge/starship-DD0B78?style=for-the-badge&logo=starship&logoColor=white" alt="Starship" />
                    <img src="https://img.shields.io/badge/warp-01A4FF?style=for-the-badge&logo=warp&logoColor=white" alt="Warp" />
                    <img src="https://img.shields.io/badge/tmux-1BB91F?style=for-the-badge&logo=tmux&logoColor=white" alt="Tmux" />
                    <img src="https://img.shields.io/badge/homebrew-FBB040?style=for-the-badge&logo=homebrew&logoColor=white" alt="Homebrew" />
                </div>
            </section>

            {/* Connect With Me Section */}
            <section className="flex flex-col gap-8 text-center bg-card/30 p-8 rounded-2xl border border-border mt-10">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold">Connect With Me</h2>
                    <div className="flex justify-center">
                        <img src="https://komarev.com/ghpvc/?username=mic-360&style=for-the-badge&color=blueviolet" alt="Profile views" />
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <p className="italic text-muted-foreground">
                        Consider giving my work a ⭐ to show some ❤️
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="https://www.facebook.com/fb.bhaumic.singh" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                            <img src="https://img.shields.io/badge/Facebook-1877F2?style=flat&logo=facebook&logoColor=white&color=black" className="h-9" alt="Facebook" />
                        </a>
                        <a href="https://www.instagram.com/bhaumic.singh/" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                            <img src="https://img.shields.io/badge/Instagram-E4405F?style=flat&logo=instagram&logoColor=white&color=black" className="h-9" alt="Instagram" />
                        </a>
                        <a href="https://www.linkedin.com/in/bhaumic/" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                            <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white&color=black" className="h-9" alt="LinkedIn" />
                        </a>
                        <a href="https://x.com/bhaumicsingh" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                            <img src="https://img.shields.io/badge/X-000000?style=flat&logo=x&logoColor=white&color=black" className="h-9" alt="X" />
                        </a>
                    </div>
                </div>
            </section>

            <div className="mt-10 flex justify-center grayscale hover:grayscale-0 transition-all">
                <img src="https://raw.githubusercontent.com/Mic-360/Mic-360/main/space-shooter.gif" alt="Space Shooter" />
            </div>

            <Link to="/" className="mr-2 inline-flex items-center gap-1 italic">
                ← back
            </Link>
        </article>
    )
}
