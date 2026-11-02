export function renderLandingPage() {
    return `
        <!-- NAVBAR -->
        <header class="navbar">
            <div class="container nav-content">

                <a href="#" class="logo">
                    Career<span>Connect</span>
                </a>

                <button class="menu-toggle" id="menuToggle"
                    aria-label="Toggle navigation" aria-expanded="false">
                    ☰
                </button>

                <nav class="nav-links" id="navLinks">
                    <a href="#home">Home</a>
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How It Works</a>
                    <a href="#about">About</a>
                </nav>

                <div class="nav-actions">
                    <a href="#login" class="login-btn">Login</a>
                    <a href="#signup" class="primary-btn">Get Started</a>
                </div>

            </div>
        </header>

        <!-- HERO -->
        <section class="hero" id="home">
            <div class="container hero-grid">

                <div class="hero-content">

                    <span class="badge">
                        ✨ Your Career Journey Starts Here
                    </span>

                    <h1>
                        Build Your Future.
                        <span>Find Your Dream Career.</span>
                    </h1>

                    <p>
                        Discover exciting opportunities, connect with
                        employers, manage applications and take your
                        professional journey to the next level.
                    </p>

                    <div class="hero-actions">
                        <a href="#signup" class="primary-btn">
                            Explore Opportunities →
                        </a>

                        <a href="#how-it-works" class="secondary-btn">
                            How It Works
                        </a>
                    </div>

                    <div class="hero-trust">
                        <div class="avatar-group">
                            <span>G</span>
                            <span>A</span>
                            <span>R</span>
                            <span>S</span>
                        </div>

                        <p>
                            <strong>10,000+</strong>
                            professionals growing their careers
                        </p>
                    </div>

                </div>

                <div class="hero-visual">

                    <div class="dashboard-preview">

                        <div class="preview-header">
                            <div>
                                <small>Welcome back!</small>
                                <h3>Your Career Dashboard</h3>
                            </div>

                            <span class="status">● Active</span>
                        </div>

                        <div class="preview-stats">

                            <div class="preview-card">
                                <small>Applications</small>
                                <h2>24</h2>
                                <span>↑ 12% this month</span>
                            </div>

                            <div class="preview-card">
                                <small>Interviews</small>
                                <h2>08</h2>
                                <span>↑ 8% this month</span>
                            </div>

                        </div>

                        <div class="application-box">
                            <h4>Recent Applications</h4>

                            <div class="application-item">
                                <div class="company-icon">G</div>
                                <div>
                                    <strong>Frontend Developer</strong>
                                    <small>Google · Applied</small>
                                </div>
                                <span>↗</span>
                            </div>

                            <div class="application-item">
                                <div class="company-icon">M</div>
                                <div>
                                    <strong>Software Engineer</strong>
                                    <small>Microsoft · Interview</small>
                                </div>
                                <span>↗</span>
                            </div>

                            <div class="application-item">
                                <div class="company-icon">A</div>
                                <div>
                                    <strong>Data Analyst</strong>
                                    <small>Amazon · Reviewing</small>
                                </div>
                                <span>↗</span>
                            </div>

                        </div>

                    </div>

                    <div class="floating-card">
                        🚀 Your next opportunity awaits!
                    </div>

                </div>

            </div>
        </section>

        <!-- STATS -->
        <section class="stats-section">
            <div class="container stats-grid">

                <div>
                    <h2>10K+</h2>
                    <p>Active Professionals</p>
                </div>

                <div>
                    <h2>5K+</h2>
                    <p>Job Opportunities</p>
                </div>

                <div>
                    <h2>2K+</h2>
                    <p>Companies</p>
                </div>

                <div>
                    <h2>95%</h2>
                    <p>User Satisfaction</p>
                </div>

            </div>
        </section>

        <!-- FEATURES -->
        <section class="section" id="features">

            <div class="container">

                <div class="section-heading">
                    <span class="badge">OUR FEATURES</span>
                    <h2>Everything You Need to Grow</h2>
                    <p>
                        Powerful tools designed to simplify your
                        career development journey.
                    </p>
                </div>

                <div class="features-grid">

                    <article class="feature-card">
                        <div class="feature-icon">🔍</div>
                        <h3>Smart Job Search</h3>
                        <p>
                            Discover opportunities based on your skills,
                            interests and career goals.
                        </p>
                    </article>

                    <article class="feature-card">
                        <div class="feature-icon">📄</div>
                        <h3>Resume Management</h3>
                        <p>
                            Organize your professional profile and
                            manage your resumes in one place.
                        </p>
                    </article>

                    <article class="feature-card">
                        <div class="feature-icon">📊</div>
                        <h3>Career Analytics</h3>
                        <p>
                            Track applications, interviews and
                            professional growth.
                        </p>
                    </article>

                    <article class="feature-card">
                        <div class="feature-icon">🤖</div>
                        <h3>AI Career Assistant</h3>
                        <p>
                            Get intelligent career guidance and
                            personalized recommendations.
                        </p>
                    </article>

                    <article class="feature-card">
                        <div class="feature-icon">🤝</div>
                        <h3>Professional Network</h3>
                        <p>
                            Connect with professionals and explore
                            new career opportunities.
                        </p>
                    </article>

                    <article class="feature-card">
                        <div class="feature-icon">🔔</div>
                        <h3>Job Notifications</h3>
                        <p>
                            Stay updated about relevant opportunities
                            and application progress.
                        </p>
                    </article>

                </div>

            </div>
        </section>

        <!-- HOW IT WORKS -->
        <section class="section how-section" id="how-it-works">

            <div class="container">

                <div class="section-heading">
                    <span class="badge">SIMPLE PROCESS</span>
                    <h2>Start Your Career in 3 Steps</h2>
                    <p>
                        Your journey towards professional success
                        starts with a few simple steps.
                    </p>
                </div>

                <div class="steps-grid">

                    <div class="step-card">
                        <span class="step-number">01</span>
                        <h3>Create Your Profile</h3>
                        <p>
                            Register and showcase your skills,
                            education and experience.
                        </p>
                    </div>

                    <div class="step-card">
                        <span class="step-number">02</span>
                        <h3>Discover Opportunities</h3>
                        <p>
                            Explore jobs that match your skills
                            and professional interests.
                        </p>
                    </div>

                    <div class="step-card">
                        <span class="step-number">03</span>
                        <h3>Grow Your Career</h3>
                        <p>
                            Apply for jobs, track progress and
                            achieve your career goals.
                        </p>
                    </div>

                </div>

            </div>
        </section>

        <!-- ABOUT -->
        <section class="section" id="about">

            <div class="container about-box">

                <div>
                    <span class="badge">YOUR FUTURE MATTERS</span>

                    <h2>
                        Your Skills.
                        Your Ambition.
                        Your Future.
                    </h2>

                    <p>
                        CareerConnect brings career discovery,
                        application management and professional
                        development together in one platform.
                    </p>

                    <a href="#signup" class="primary-btn">
                        Start Your Journey →
                    </a>
                </div>

                <div class="about-visual">
                    <div class="about-icon">🎯</div>
                    <h3>Build. Connect. Succeed.</h3>
                    <p>Your career journey, simplified.</p>
                </div>

            </div>

        </section>

        <!-- CTA -->
        <section class="cta-section" id="signup">

            <div class="container">
                <h2>Ready to Build Your Future?</h2>

                <p>
                    Take the first step towards your dream career
                    with CareerConnect.
                </p>

                <a href="#register" class="cta-button">
                    Get Started Today →
                </a>
            </div>

        </section>

        <!-- FOOTER -->
        <footer class="footer">

            <div class="container footer-content">

                <div>
                    <a href="#home" class="logo">
                        Career<span>Connect</span>
                    </a>

                    <p>
                        Empowering professionals to discover
                        opportunities and build successful careers.
                    </p>
                </div>

                <div class="footer-links">
                    <a href="#home">Home</a>
                    <a href="#features">Features</a>
                    <a href="#about">About</a>
                    <a href="#signup">Get Started</a>
                </div>

            </div>

            <div class="copyright">
                © 2026 CareerConnect. All rights reserved.
            </div>

        </footer>
    `;
}


// MOBILE NAVIGATION
document.addEventListener("click", (event) => {

    if (event.target.closest("#menuToggle")) {

        const nav = document.querySelector("#navLinks");
        const button = document.querySelector("#menuToggle");

        const isOpen = nav.classList.toggle("active");

        button.setAttribute("aria-expanded", String(isOpen));
    }

    if (event.target.closest("#navLinks a")) {

        document.querySelector("#navLinks").classList.remove("active");

        document.querySelector("#menuToggle")
            ?.setAttribute("aria-expanded", "false");
    }

});