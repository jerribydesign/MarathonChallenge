# Rive Animation Setup Guide

## Step 1: Install Rive Package

Run this command in your terminal:
```bash
cd marathon-challenge
npm install rive-react
```

If you get permission errors, try:
```bash
npm install rive-react --cache /tmp/npm-cache
```

## Step 2: Add Your Rive File

1. Export your Rive animation file (`.riv` format) from Rive Editor
2. Place your Rive file in the `public/assets/` folder
3. Name it `runner.riv` (or update the path in `MarathonMap.tsx`)

Example:
```
marathon-challenge/
  public/
    assets/
      runner.riv  ← Your Rive file here
```

## Step 3: Update Component (if needed)

If your Rive file has a different name or state machine:

1. Open `components/MarathonMap.tsx`
2. Find this line:
   ```typescript
   src: '/assets/runner.riv',
   ```
3. Change `runner.riv` to your file name

4. If your state machine has a different name, update:
   ```typescript
   stateMachines: 'State Machine 1', // Change to your state machine name
   ```

## Step 4: Optional - Control Animation Inputs

If your Rive animation has inputs (like speed, direction), you can control them:

```typescript
// In MarathonMap.tsx, after the useRive hook:
const speedInput = useStateMachineInput(rive, 'State Machine 1', 'speed', 1);

// Then update it based on progress:
useEffect(() => {
  if (speedInput) {
    speedInput.value = progress * 2; // Adjust speed based on progress
  }
}, [progress, speedInput]);
```

## Troubleshooting

- **File not loading?** Make sure the file is in `public/assets/` and the path is correct
- **Animation not playing?** Check your state machine name matches
- **Fallback showing?** The emoji runner will show if Rive file isn't found (this is normal until you add your file)

## Rive File Requirements

- Format: `.riv` file
- Recommended size: 64x64px to 128x128px for the runner
- State Machine: Should have a default state that loops (like "Running" or "Idle")
