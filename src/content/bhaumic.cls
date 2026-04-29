\ProvidesClass{bhaumic}[2026/03/07 Resume Class]
\NeedsTeXFormat{LaTeX2e}

\DeclareOption*{\PassOptionsToClass{\CurrentOption}{article}}
\ProcessOptions\relax
\LoadClass[10pt,a4paper]{article}

%% ─── Core packages ─────────────────────────────────────────
\RequirePackage[T1]{fontenc}
\RequirePackage[utf8]{inputenc}
\RequirePackage{helvet}
\renewcommand{\familydefault}{\sfdefault}
\RequirePackage{microtype}
\RequirePackage[left=1.1cm,right=1.1cm,top=0.6cm,bottom=0.6cm]{geometry}
\RequirePackage{xcolor}
\RequirePackage{enumitem}
\RequirePackage{array}
\RequirePackage{tabularx}
\RequirePackage{setspace}
\RequirePackage{ragged2e}
\RequirePackage{parskip}
\RequirePackage{etoolbox}
\RequirePackage{fancyhdr}
\RequirePackage{calc}
\RequirePackage{ifthen}
\RequirePackage[hidelinks]{hyperref}
\RequirePackage{bookmark}

\setlength{\parindent}{0pt}
\setlength{\parskip}{0pt}
\pagestyle{empty}

%% ─── Colours ────────────────────────────────────────────────
\definecolor{accent}{HTML}{1A5276}
\definecolor{accentlight}{HTML}{2E86C1}
\definecolor{rulecol}{HTML}{7F8C8D}
\definecolor{darktext}{HTML}{1C2833}
\definecolor{bodytext}{HTML}{2C3E50}
\definecolor{graytext}{HTML}{717D7E}

%% ════════════════════════════════════════════════════════════
%%  HEADER
%%  FIX: positive vspace below center block so hrule never
%%       cuts through the contacts/links row.
%% ════════════════════════════════════════════════════════════
\newcommand{\makeheader}[7]{%
  \begin{center}%
    {\fontsize{22pt}{24pt}\selectfont\bfseries\color{darktext}#1\ #2}\\[3pt]%
    {\small\color{accentlight}\bfseries #3}\\[5pt]%
    {\footnotesize\color{bodytext}%
      % \textbf{Phone:}~#4%
      % ~\textcolor{rulecol}{|}~%
      \textbf{Email:}~\href{mailto:#5}{#5}%
      ~\textcolor{rulecol}{|}~%
      \textbf{GitHub:}~\href{https://#6}{#6}%
      ~\textcolor{rulecol}{|}~%
      \textbf{LinkedIn:}~\href{https://#7}{#7}%
    }%
  \end{center}%
}

\newcommand{\medium}{\fontsize{10pt}{12pt}\selectfont}

%% ════════════════════════════════════════════════════════════
%%  SECTION HEADING — consistent vertical rhythm
%% ════════════════════════════════════════════════════════════
\newcommand{\ressection}[1]{%
  \vspace{12pt}%
  {\color{accentlight}\fontsize{13.5pt}{15pt}\selectfont\bfseries\MakeUppercase{#1}}
  \vspace{2pt}%
  {\color{rulecol}\hrule height 0.8pt}%
  \vspace{6pt}%
}

%% ════════════════════════════════════════════════════════════
%%  SUMMARY
%% ════════════════════════════════════════════════════════════
\newenvironment{resumesummary}{%
  \vspace{4pt}%
  \small\color{bodytext}\setstretch{1.12}%
}{\par\vspace{0pt}}

%% ════════════════════════════════════════════════════════════
%%  SKILLS TABLE
%%  FIX: arraystretch=1.0, extrarowheight=0pt, no [Xpt] gap
%%       after each row — eliminates the huge inter-row spaces.
%% ════════════════════════════════════════════════════════════
\newenvironment{skilltable}{%
  \vspace{1pt}%
  \begingroup
  \renewcommand{\arraystretch}{0.55}%   ← tight: kills the bloated inter-row space
  \setlength{\extrarowheight}{0pt}%
  \setlength{\tabcolsep}{3pt}%
  \begin{tabular}{@{\hspace{1pt}} p{3.0cm} @{\hspace{4pt}} p{\dimexpr\textwidth - 3.0cm - 10pt}}%
}{%
  \end{tabular}%
  \endgroup
  \vspace{1pt}%
}

%% Skill row — plain \\ with NO trailing vertical skip
\newcommand{\skillrow}[2]{%
  {\medium\bfseries\color{darktext}#1} &
  % {\footnotesize\color{bodytext}#2}\\%
  {\fontsize{7pt}{6pt}\color{bodytext}#2}\\%
}

%% ════════════════════════════════════════════════════════════
%%  EXPERIENCE ENTRY
%%  Layout:  Row 1 → Company (bold)            | Date (italic gray)
%%           Row 2 → Role (accent italic)       | Type (gray)
%% ════════════════════════════════════════════════════════════
\newcommand{\expentry}[5]{%
  \vspace{4pt}%
  % Row 1: Company LEFT | Date RIGHT — hfill guarantees same baseline
  \noindent{\medium\bfseries\color{darktext}#2}\hfill{\small\color{graytext}\textit{#3}}\par
  \vspace{-1pt}%
  % Row 2: Role LEFT | Employment type RIGHT
  \noindent{\small\color{accentlight}\textit{#1}}\hfill{\small\color{graytext}#4}\par
  \vspace{3pt}%
  #5%
}

%% ════════════════════════════════════════════════════════════
%%  PROJECT ENTRY
%%  Layout:  Row 1 → Project name (bold)       | Link (accent)
%%           Then 2pt gap + tech stack (italic gray) on its own line
%%           Then 2pt gap + bullets
%%  \nopagebreak[4] prevents page break inside the header rows
%% ════════════════════════════════════════════════════════════
\newcommand{\projentry}[5]{%
  \vspace{3pt}%
  \nopagebreak[4]%
  % Row 1: Project name LEFT | Link RIGHT — hfill, same baseline
  \noindent{\small\bfseries\color{darktext}#1}\hfill{\small\color{accentlight}\href{#4}{#3}}\par
  \nopagebreak[4]%
  \vspace{1pt}%
  % Tech stack — its own line, slightly indented feel via \textit
  \noindent{\small\color{graytext}\textit{#2}}\par
  \nopagebreak[4]%
  \vspace{3pt}%
  #5%
  \vspace{4pt}%
}

%% ════════════════════════════════════════════════════════════
%%  BULLET LIST
%% ════════════════════════════════════════════════════════════
\newenvironment{resbullets}{%
  \vspace{-1pt}%
  \begin{itemize}[%
    leftmargin=1.5em,%
    itemsep=1.5pt,%
    topsep=1pt,%
    parsep=0pt,%
    partopsep=0pt,%
    label={\footnotesize\color{accent}$\bullet$}%
  ]%
  \small\color{bodytext}\setstretch{1.05}%
}{%
  \end{itemize}%
  \vspace{-3pt}%
}

%% ════════════════════════════════════════════════════════════
%%  EDUCATION ENTRY
%%  Layout:  Row 1 → Institution (bold)        | Dates (italic gray)
%%           Row 2 → Degree / Course (accent)  | CGPA (gray)
%% ════════════════════════════════════════════════════════════
\newcommand{\eduentry}[4]{%
  \vspace{3pt}%
  % Row 1: Institution LEFT | Dates RIGHT
  \noindent{\small\bfseries\color{darktext}#2}\hfill{\small\color{graytext}\textit{#3}}\par
  \vspace{-1pt}%
  % Row 2: Degree LEFT | CGPA RIGHT
  \noindent{\small\color{accentlight}#1}\hfill{\small\color{graytext}\textbf{#4}}\par
  \vspace{1pt}%
}

%% ════════════════════════════════════════════════════════════
%%  CERTIFICATION ROW — single line via hfill
%%  Name LEFT  ·  Org  ·  Status  ·  Year RIGHT
%% ════════════════════════════════════════════════════════════
\newcommand{\certrow}[4]{%
  \vspace{3pt}%
  \noindent%
  {\small\bfseries\color{darktext}#1}%
  \hfill%
  {\small\color{graytext}#2}%
  \quad{\small\color{accentlight}\textit{#3}}%
  \quad{\small\bfseries\color{graytext}#4}\par
  \vspace{0pt}%
}