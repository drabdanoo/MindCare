# Shadow Property Fixes

## Issue Description

The application was using deprecated shadow properties (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`) which are deprecated in React Native Web. These needed to be replaced with the modern `boxShadow` property for web compatibility.

## Files Modified

### PatientDashboard.js

Replaced deprecated shadow properties with platform-specific implementations:

```javascript
// Before
welcomeCard: {
  // ... other styles
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
}

// After
welcomeCard: {
  // ... other styles
  ...Platform.select({
    android: { elevation: 5 },
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
    },
    web: {
      boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    },
    default: {},
  }) || {},
}
```

Similar changes were made to the `statCard` style.

### DoctorDashboard.js

Applied the same platform-specific shadow implementation to:
- `welcomeCard` style
- `statCard` style

## Benefits

1. **Cross-platform compatibility**: Uses appropriate shadow implementations for each platform
2. **Web compliance**: Uses modern `boxShadow` CSS property for web
3. **Native compatibility**: Maintains native iOS shadow properties and Android elevation
4. **Future-proof**: Follows React Native Web best practices

## Testing

The changes have been tested and verified to work correctly on:
- Web browser (Chrome)
- iOS simulator
- Android emulator

All visual appearances remain consistent across platforms.