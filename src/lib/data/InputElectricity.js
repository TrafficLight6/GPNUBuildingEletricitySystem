export function getACVoltage() {
  return Math.round((220 + Math.random()) * 10) / 10
}

export function getACFrequency() {
  return Math.round((49.8 + Math.random() * 0.4) * 100) / 100
}

export function getACCurrent() {
  return Math.round((52 + Math.random() * 10) * 100) / 100
}

export function getACPower() {
  return Math.round((220 * 52) / 1000) / 100
}