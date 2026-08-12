'use client';
import Link from 'next/link';
import styles from '../public-pages.module.css';
import Logo from '../../components/Logo/Logo';

const sections = [
  {
    id: '1-acceptance-of-terms',
    title: '1. Acceptance of Terms',
    points: [
      'You are at least 13 years of age (or the minimum age required in your jurisdiction).',
      'You have the legal capacity to enter into this Agreement.',
      'You accept these Terms of Service, our Privacy Policy, and our Cookie Policy in their entirety.'
    ],
    intro: 'By creating an account on the Platform, you confirm that:'
  },
  {
    id: '2-account-registration-security',
    title: '2. Account Registration & Security',
    subsections: [
      {
        subtitle: '2.1 Account Creation',
        points: [
          'You must provide accurate, complete, and current information during registration.',
          'You are responsible for maintaining the confidentiality of your account credentials.',
          'One person may not maintain more than one account.',
          'Accounts created by automated means (bots) are not permitted.'
        ]
      },
      {
        subtitle: '2.2 Account Security',
        points: [
          'You are solely responsible for all activities that occur under your account.',
          'You must notify us immediately of any unauthorized access or security breach.',
          'We reserve the right to suspend accounts that show suspicious activity.'
        ]
      },
      {
        subtitle: '2.3 Account Deletion',
        points: [
          'You may request deletion of your account at any time through the account settings.',
          'Upon deletion, your data will be permanently removed within 30 days, except where retention is required by law.'
        ]
      }
    ]
  },
  {
    id: '3-license-grant',
    title: '3. License Grant',
    text: 'Nothingbox Labs grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform solely for its intended purposes, subject to the terms of this Agreement.'
  },
  {
    id: '4-strict-restrictions',
    title: '4. Strict Restrictions & Security',
    intro: 'The architecture, routing mechanisms, and backend logic of the Platform are strictly confidential and proprietary. You shall not, under any circumstances:',
    points: [
      'Reverse-engineer, decompile, disassemble, or attempt to derive the source code of any part of the Platform.',
      'Attempt to trace, monitor, bypass, or manipulate the custom network routing and isolated execution environments.',
      'Probe, scan, or test the vulnerability of the system, or execute any unauthorized automated scripts.',
      'Use any data mining, scraping, or similar data-gathering methods.',
      'Attempt to access any service, data, account, or network without authorization.'
    ]
  },
  {
    id: '5-acceptable-use',
    title: '5. Acceptable Use Policy',
    intro: 'You agree NOT to use the Platform to:',
    points: [
      'Upload, transmit, or distribute any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.',
      'Impersonate any person or entity, or falsely claim an affiliation with any person or entity.',
      'Engage in any activity that could disable, overburden, or impair the Platform\'s infrastructure.',
      'Distribute spam, malware, viruses, or any other harmful technology.',
      'Violate any applicable local, national, or international law or regulation.',
      'Harvest, collect, or store personal data of other users without their consent.'
    ]
  },
  {
    id: '6-user-content',
    title: '6. User Content',
    subsections: [
      {
        subtitle: '6.1 Ownership',
        text: 'You retain ownership of any content you upload, post, or transmit through the Platform ("User Content").'
      },
      {
        subtitle: '6.2 License to Us',
        text: 'By uploading User Content, you grant Nothingbox Labs a non-exclusive, worldwide, royalty-free license to use, store, and process your content solely for the purpose of operating and improving the Platform.'
      },
      {
        subtitle: '6.3 Content Responsibility',
        text: 'You are solely responsible for your User Content. We do not endorse or guarantee the accuracy of any User Content and are not liable for any User Content posted by users.'
      }
    ]
  },
  {
    id: '7-privacy-policy',
    title: '7. Privacy Policy',
    subsections: [
      {
        subtitle: '7.1 Data We Collect',
        points: [
          'Account Information: Username, email address, name, and password (hashed).',
          'Usage Data: Login timestamps, device information, IP addresses, and session data.',
          'Communication Data: Messages and files shared through the Platform\'s messaging features.'
        ]
      },
      {
        subtitle: '7.2 How We Use Your Data',
        points: [
          'To provide, maintain, and improve the Platform.',
          'To authenticate your identity and secure your account.',
          'To communicate important updates, security alerts, and service notifications.',
          'To detect and prevent fraud, abuse, and security threats.'
        ]
      },
      {
        subtitle: '7.3 Data Sharing',
        points: [
          'We do NOT sell your personal data to third parties.',
          'We may share data with third-party service providers (e.g., Firebase, MongoDB) strictly for Platform operations.',
          'We may disclose data if required by law or to protect our rights and safety.'
        ]
      },
      {
        subtitle: '7.4 Data Storage & Security',
        points: [
          'All data is encrypted in transit (TLS/SSL) and at rest.',
          'We implement industry-standard security measures including RSA handshakes and AES encryption for sensitive payloads.',
          'Data is stored on secure servers and access is restricted to authorized personnel only.'
        ]
      },
      {
        subtitle: '7.5 Your Rights',
        points: [
          'Access: You can request a copy of your personal data.',
          'Correction: You can update your account information at any time.',
          'Deletion: You can request complete deletion of your account and associated data.',
          'Portability: You can request your data in a machine-readable format.'
        ]
      }
    ]
  },
  {
    id: '8-cookie-policy',
    title: '8. Cookie Policy',
    subsections: [
      {
        subtitle: '8.1 What Cookies We Use',
        points: [
          'Essential Cookies: Required for authentication, session management, and security. These cannot be disabled.',
          'Performance Cookies: Help us understand how you interact with the Platform to improve user experience.'
        ]
      },
      {
        subtitle: '8.2 Cookie Management',
        points: [
          'You can manage cookie preferences through your browser settings.',
          'Disabling essential cookies may prevent you from using the Platform.'
        ]
      },
      {
        subtitle: '8.3 Third-Party Cookies',
        points: [
          'We use Firebase for authentication which may set its own cookies.',
          'We do not use advertising or tracking cookies.'
        ]
      }
    ]
  },
  {
    id: '9-intellectual-property',
    title: '9. Intellectual Property',
    text: 'All rights, title, and interest in the Platform, including source code, custom security architectures, algorithms, design elements, trademarks, and related intellectual property, remain the exclusive property of Nothingbox Labs. Nothing in this Agreement grants you any right to use our trademarks, logos, or brand assets.'
  },
  {
    id: '10-termination',
    title: '10. Termination of Access',
    subsections: [
      {
        subtitle: '10.1 By Us',
        text: 'Nothingbox Labs reserves the right to immediately terminate, block, or suspend your access without prior notice if any unauthorized entry, security violation, hacking attempt, or breach of this Agreement is detected.'
      },
      {
        subtitle: '10.2 By You',
        text: 'You may terminate your account at any time by deleting it through the account settings or by contacting us.'
      },
      {
        subtitle: '10.3 Effect of Termination',
        text: 'Upon termination, your right to use the Platform immediately ceases. We may retain certain data as required by law.'
      }
    ]
  },
  {
    id: '11-disclaimer',
    title: '11. Disclaimer of Warranty',
    text: 'THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. NOTHINGBOX LABS DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.'
  },
  {
    id: '12-liability',
    title: '12. Limitation of Liability',
    text: 'IN NO EVENT SHALL NOTHINGBOX LABS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE PLATFORM, REGARDLESS OF THE THEORY OF LIABILITY.'
  },
  {
    id: '13-changes',
    title: '13. Changes to This Agreement',
    text: 'We reserve the right to modify this Agreement at any time. If we make material changes, we will notify you via email or through a prominent notice on the Platform. Your continued use of the Platform after such changes constitutes acceptance of the updated terms.'
  },
  {
    id: '14-contact',
    title: '14. Contact Information',
    points: [
      'Email: legal@nothingbox.site',
      'Company: Nothingbox Labs',
      'Jurisdiction: Bhavnagar, Gujarat, India'
    ],
    intro: 'For questions or concerns about this Agreement, contact us at:'
  },
  {
    id: '15-governing-law',
    title: '15. Governing Law & Jurisdiction',
    text: 'This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts located in Bhavnagar, Gujarat.'
  }
];

function Section({ section }) {
  return (
    <div id={section.id} style={{ marginBottom: '2rem' }}>
      <h3>{section.title}</h3>

      {section.text && <p>{section.text}</p>}

      {section.intro && <p>{section.intro}</p>}

      {section.points && (
        <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0' }}>
          {section.points.map((p, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{p}</li>)}
        </ul>
      )}

      {section.subsections && section.subsections.map((sub, i) => (
        <div key={i} style={{ marginTop: '1rem' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#ccc', marginBottom: '0.4rem' }}>{sub.subtitle}</h4>
          {sub.text && <p>{sub.text}</p>}
          {sub.points && (
            <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0' }}>
              {sub.points.map((p, j) => <li key={j} style={{ marginBottom: '0.4rem' }}>{p}</li>)}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <Logo forceVersion="icon" />

      <div className={styles.card} style={{ maxWidth: '720px' }}>
        <header className={styles.header}>
          <h1 className={styles.title}>Terms of Service & EULA</h1>
          <p className={styles.subtitle}>Effective Date: August 12, 2026 &middot; Nothingbox Labs</p>
        </header>

        <div className={styles.content}>
          <p style={{ marginBottom: '1.5rem' }}>
            This End User License Agreement and Terms of Service is a binding legal contract between you ("User") and Nothingbox Labs ("Company") governing the use of the Cloud-Base Platform (nothingbox.site). By creating an account, you acknowledge that you have read, understood, and agree to be bound by this Agreement.
          </p>

          {sections.map((s) => (
            <Section key={s.id} section={s} />
          ))}

          <p style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', fontSize: '0.85rem', color: '#888', textAlign: 'center' }}>
            By creating an account on Cloud-Base, you acknowledge that you have read and agree to this End User License Agreement & Terms of Service.
          </p>
        </div>

        <div className={styles.footer}>
          <Link href="/" className={styles.backBtn}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
