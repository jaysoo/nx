import { findMatchingSimulator } from './run-ios.impl';

describe('findMatchingSimulator', () => {
  let devices;

  beforeEach(() => {
    devices = createDevices();
  });

  it('should find the simulator matching the device', () => {
    expect(findMatchingSimulator(devices, 'iPhone 8')).toEqual({
      name: 'iPhone 8',
      version: 'iOS 11.1',
      booted: false,
      udid: 'ECB775E4-34F7-4AE1-8788-B2C3DEFBC6C2',
    });
  });

  it('should match on version', () => {
    expect(findMatchingSimulator(devices, 'iPhone X (12.1)')).toEqual({
      name: 'iPhone X',
      version: 'iOS 12.1',
      booted: true,
      udid: 'BCAD0CDD-E6B9-454E-91E4-60151D5543D5',
    });
  });

  it('should return first simulator if name not provided', () => {
    expect(findMatchingSimulator(devices)).toEqual({
      name: 'iPhone 8',
      version: 'iOS 11.1',
      booted: false,
      udid: 'ECB775E4-34F7-4AE1-8788-B2C3DEFBC6C2',
    });
  });

  it('should ignore Apple Watch', () => {
    expect(
      findMatchingSimulator(devices, 'Apple Watch Series 2 - 38mm')
    ).toEqual(null);
  });

  function createDevices() {
    return {
      'iOS 11.1': [
        {
          availability: '(available)',
          state: 'Shutdown',
          isAvailable: true,
          name: 'iPhone 8',
          udid: 'ECB775E4-34F7-4AE1-8788-B2C3DEFBC6C2',
          availabilityError: '',
        },
        {
          availability: '(available)',
          state: 'Shutdown',
          isAvailable: true,
          name: 'iPhone X',
          udid: 'BCAD0CDD-E6B9-454E-91E4-60151D5543D6',
          availabilityError: '',
        },
      ],
      'iOS 12.1': [
        {
          availability: '(available)',
          state: 'Shutdown',
          isAvailable: true,
          name: 'iPhone 8',
          udid: 'ECB775E4-34F7-4AE1-8788-B2C3DEFBC6C3',
          availabilityError: '',
        },
        {
          availability: '(available)',
          state: 'Booted',
          isAvailable: true,
          name: 'iPhone X',
          udid: 'BCAD0CDD-E6B9-454E-91E4-60151D5543D5',
          availabilityError: '',
        },
      ],
      'watchOS 5.1': [
        {
          availability: '(available)',
          state: 'Shutdown',
          isAvailable: true,
          name: 'Apple Watch Series 2 - 38mm',
          udid: '4E3FAA72-9018-4E7E-8442-7DD3B86C0FFD',
          availabilityError: '',
        },
      ],
      'tvOS 12.1': [
        {
          availability: '(available)',
          state: 'Shutdown',
          isAvailable: true,
          name: 'Apple TV',
          udid: '375EABC9-BE59-4A27-A536-5C8DB81CF0A8',
          availabilityError: '',
        },
      ],
    };
  }
});
