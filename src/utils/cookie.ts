/**
 * Menyimpan data ke dalam cookie secara aman
 * @param name Nama key cookie
 * @param value Nilai yang ingin disimpan
 * @param days Masa berlaku cookie dalam hari (default 7 hari)
 */
export const setCookie = (name: string, value: string, days = 7): void => {
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }

  // Deteksi protokol HTTPS untuk menerapkan atribut Secure
  const isSecure = window.location.protocol === 'https:'
  const secureAttr = isSecure ? '; Secure' : ''

  // Menggunakan SameSite=Lax untuk perlindungan dasar terhadap CSRF
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax${secureAttr}`
}

/**
 * Mengambil data dari cookie berdasarkan nama key
 * @param name Nama key cookie
 * @returns string | null
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    if (!c) continue
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length)
    }
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length))
    }
  }
  return null
}

/**
 * Menghapus cookie berdasarkan nama key
 * @param name Nama key cookie
 */
export const deleteCookie = (name: string): void => {
  // Set expired date ke masa lalu untuk memicu penghapusan otomatis oleh browser
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`
}
