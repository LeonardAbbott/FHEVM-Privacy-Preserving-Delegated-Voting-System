# Video Demonstration Script
## FHEVM Privacy-Preserving Delegated Voting System

**Total Duration**: 60 seconds

---

## Scene 1: Introduction (0-8 seconds)
**Visual**: Animated title screen with FHEVM logo and project name

**Narrator**:
"Welcome to the FHEVM Privacy-Preserving Delegated Voting System - a breakthrough in secure blockchain governance using Fully Homomorphic Encryption."

---

## Scene 2: Problem Statement (8-15 seconds)
**Visual**: Split screen showing traditional voting (exposed data) vs encrypted voting (locked data)

**Narrator**:
"Traditional blockchain voting exposes individual choices on-chain. Our solution uses FHE technology to keep votes completely private while enabling verifiable computation."

---

## Scene 3: Live Demo - Setup (15-25 seconds)
**Visual**: Screen recording of the web application

**Actions Shown**:
- Browser opens to delegated-voting.vercel.app
- MetaMask connection prompt appears
- Network switches to Sepolia testnet
- FHE keys generate automatically
- Wallet address displays as connected

**Narrator**:
"Watch as we connect to the live application on Sepolia testnet. MetaMask connects seamlessly, and FHE encryption keys are generated automatically for privacy-preserving operations."

---

## Scene 4: Core Features Demo (25-45 seconds)
**Visual**: Fast-paced screen recording showing key features

**Actions Shown**:
1. **Voter Registration** (3 seconds)
   - Click "Register as Voter" button
   - MetaMask transaction confirmation
   - Success message displays

2. **Proposal Creation** (3 seconds)
   - Enter proposal: "Should we increase community rewards?"
   - Click "Create Proposal"
   - On-chain transaction confirmation

3. **Encrypted Voting** (5 seconds)
   - Proposal appears in voting interface
   - Click "Vote YES" button
   - Show encryption process visual effect
   - Transaction submitted with encrypted data

4. **Delegation Feature** (4 seconds)
   - Enter delegate address
   - Click "Delegate Vote"
   - Voting power transfers on-chain

5. **Blockchain Verification** (5 seconds)
   - Switch to Etherscan
   - Show contract interaction
   - Highlight encrypted vote data (unreadable hash)

**Narrator**:
"The system demonstrates four key features: First, voter registration on-chain. Second, proposal creation with automatic deadlines. Third, encrypted voting where your choice is hidden using FHE. And fourth, flexible delegation allowing you to transfer voting power to trusted representatives. Notice on Etherscan how individual votes remain encrypted and unreadable."

---

## Scene 5: Technical Highlights (45-52 seconds)
**Visual**: Code snippets and architecture diagram overlay

**Elements Shown**:
- Smart contract code highlighting euint32 encrypted types
- TFHE.select() and TFHE.add() homomorphic operations
- Access control modifiers
- Result decryption function (owner-only)

**Narrator**:
"Under the hood, votes are stored as encrypted euint32 values. Homomorphic operations enable vote tallying without decryption. Only the contract owner can decrypt final results using cryptographic proofs."

---

## Scene 6: Conclusion & Call to Action (52-60 seconds)
**Visual**: Summary screen with deployment details and QR codes

**Text Overlays**:
- Contract: 0xA52413121E6C22502efACF91714889f85BaA9A88
- Live Demo: delegated-voting.vercel.app
- GitHub: [Repository Link]
- Built with FHEVM by Zama

**Narrator**:
"This production-ready system is deployed on Sepolia testnet. Try it yourself at the link shown, explore the verified contract on Etherscan, or dive into the open-source code. Privacy-preserving governance is now a reality with FHEVM."

**End Screen**: Logo with tagline "Built for Zama FHEVM Bounty December 2025"

---

## Technical Requirements

### Video Specifications
- **Resolution**: 1920x1080 (1080p)
- **Frame Rate**: 30 fps
- **Format**: MP4 (H.264 codec)
- **Audio**: Clear narration with background music (subtle, non-intrusive)
- **Captions**: English subtitles throughout

### Visual Guidelines
- Clean, professional interface recordings
- Smooth transitions between scenes
- Highlight mouse clicks and important UI elements
- Use callout boxes for key information
- Maintain consistent branding colors (FHEVM blue/purple theme)

### Recording Tools Recommended
- Screen Recording: OBS Studio or Camtasia
- Video Editing: DaVinci Resolve or Adobe Premiere
- Audio: Professional microphone for narration
- Graphics: Canva or Adobe After Effects for overlays

### Pacing Notes
- Keep transitions quick (0.5-1 second)
- Allow 2-3 seconds for viewers to read on-screen text
- MetaMask transactions should be sped up (2x) in editing
- Use visual effects to emphasize encryption process
- Maintain energy and momentum throughout

---

## Alternative 60-Second Format (Fast-Paced)

If the above timing is too tight, use this condensed version:

**0-10s**: Introduction + Problem (combined)
**10-45s**: Live demo of all features (faster pace, less narration)
**45-55s**: Technical highlights (quick code showcase)
**55-60s**: Conclusion with deployment info

---

## Post-Production Checklist

- ✅ Video exports at 60 seconds exactly
- ✅ Audio levels normalized (-14 LUFS)
- ✅ All text on-screen readable at 1080p
- ✅ Subtitles synchronized perfectly
- ✅ Contract addresses visible and accurate
- ✅ Links verified and working
- ✅ Final quality check on multiple devices
- ✅ Thumbnail created (1920x1080)

---

**Note**: See VIDEO_DIALOGUE for the complete narration script without timing marks.
