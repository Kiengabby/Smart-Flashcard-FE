import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class WebSpeechService {
  private synth = window.speechSynthesis;
  private isSpeaking = false;

  constructor(private message: NzMessageService) {
    // Load available voices
    if (this.synth) {
      this.synth.onvoiceschanged = () => {
        const voices = this.synth.getVoices();
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      };
    }
  }

  /**
   * Phát âm thanh bằng Web Speech API của trình duyệt
   * @param text Văn bản cần phát âm
   * @param language Ngôn ngữ (vi-VN, en-US)
   */
  speakText(text: string, language: string = 'en-US'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        this.message.error('Trình duyệt không hỗ trợ Text-to-Speech');
        reject('Speech synthesis not supported');
        return;
      }

      // Dừng âm thanh hiện tại nếu có
      if (this.isSpeaking) {
        this.synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Cấu hình giọng nói theo ngôn ngữ
      utterance.lang = language;
      
      // Tùy chỉnh tốc độ và cao độ theo ngôn ngữ
      if (language.startsWith('ja')) {
        utterance.rate = 0.7; // Tiếng Nhật nói chậm hơn
        utterance.pitch = 1.1; // Cao độ hơi cao
      } else if (language.startsWith('vi')) {
        utterance.rate = 0.8; // Tiếng Việt vừa phải
        utterance.pitch = 1.0;
      } else {
        utterance.rate = 0.8; // Tiếng Anh bình thường
        utterance.pitch = 1.0;
      }
      utterance.volume = 1; // Âm lượng (0 - 1)

      // Tìm giọng nói phù hợp - ưu tiên giọng nữ
      const voices = this.synth.getVoices();
      const langCode = language.split('-')[0];
      
      // Tìm giọng nói theo thứ tự ưu tiên (macOS có giọng chất lượng cao)
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
      
      let voice;
      if (isMac) {
        // macOS: Ưu tiên giọng Siri và Neural voices
        voice = voices.find(v => v.lang === language && (v.name.includes('Siri') || v.name.includes('Premium'))) ||
                voices.find(v => v.lang === language && v.name.includes('Enhanced')) ||
                voices.find(v => v.lang === language) ||
                voices.find(v => v.lang.includes(langCode)) ||
                voices[0];
      } else {
        // Windows/Linux: Ưu tiên giọng nữ
        voice = voices.find(v => v.lang === language && v.name.includes('Female')) ||
                voices.find(v => v.lang === language) ||
                voices.find(v => v.lang.includes(langCode) && v.name.includes('Female')) ||
                voices.find(v => v.lang.includes(langCode)) ||
                voices[0];
      }
      
      if (voice) {
        utterance.voice = voice;
        console.log(`Using voice: ${voice.name} (${voice.lang}) for language: ${language}`);
      }

      // Xử lý sự kiện
      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        console.error('Speech synthesis error:', event);
        this.message.error('Lỗi khi phát âm thanh');
        reject(event);
      };

      // Phát âm
      this.synth.speak(utterance);
    });
  }

  /**
   * Dừng phát âm
   */
  stopSpeaking(): void {
    if (this.synth && this.isSpeaking) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Kiểm tra trạng thái phát âm
   */
  get isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Lấy danh sách tất cả ngôn ngữ có sẵn
   */
  getAvailableLanguages(): string[] {
    if (!this.synth) return [];
    
    const voices = this.synth.getVoices();
    const languages = [...new Set(voices.map(v => v.lang))];
    return languages.sort();
  }

  /**
   * Lấy danh sách giọng nói theo ngôn ngữ
   */
  getVoicesByLanguage(language: string): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    
    const voices = this.synth.getVoices();
    return voices.filter(v => v.lang.includes(language));
  }

  /**
   * Kiểm tra xem ngôn ngữ có được hỗ trợ không
   */
  isLanguageSupported(language: string): boolean {
    const availableLanguages = this.getAvailableLanguages();
    return availableLanguages.some(lang => lang.includes(language));
  }

  /**
   * Phát hiện ngôn ngữ từ text với hỗ trợ nhiều ngôn ngữ
   */
  detectLanguage(text: string): string {
    // Kiểm tra ký tự tiếng Việt
    const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/;
    
    // Kiểm tra ký tự tiếng Nhật (Hiragana, Katakana, Kanji)
    const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    
    // Kiểm tra ký tự tiếng Hàn
    const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;
    
    // Kiểm tra ký tự tiếng Trung (chỉ Hanzi, không trùng với Kanji)
    const chineseRegex = /[\u4E00-\u9FAF]/;
    
    // Kiểm tra ký tự tiếng Thái
    const thaiRegex = /[\u0E00-\u0E7F]/;
    
    // Kiểm tra ký tự tiếng Ả Rập
    const arabicRegex = /[\u0600-\u06FF]/;
    
    // Kiểm tra ký tự Cyrillic (Nga, Ukraina, Bulgaria, Serbia...)
    const cyrillicRegex = /[\u0400-\u04FF]/;
    
    // Kiểm tra ký tự Hy Lạp
    const greekRegex = /[\u0370-\u03FF]/;
    
    // Kiểm tra ký tự Hebrew
    const hebrewRegex = /[\u0590-\u05FF]/;

    // Kiểm tra ký tự có dấu châu Âu (Pháp, Đức, Tây Ban Nha, Ý...)
    const europeanRegex = /[àâäáãåæçéèêëíìîïñóòôöõøúùûüýÿßÀÂÄÁÃÅÆÇÉÈÊËÍÌÎÏÑÓÒÔÖÕØÚÙÛÜÝŸ]/;

    if (vietnameseRegex.test(text)) {
      return 'vi-VN';
    } else if (japaneseRegex.test(text)) {
      // Phân biệt Nhật và Trung bằng cách kiểm tra Hiragana/Katakana
      if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
        return 'ja-JP';
      } else {
        return 'zh-CN'; // Có thể là tiếng Trung với chữ Hán
      }
    } else if (koreanRegex.test(text)) {
      return 'ko-KR';
    } else if (chineseRegex.test(text)) {
      return 'zh-CN';
    } else if (thaiRegex.test(text)) {
      return 'th-TH';
    } else if (arabicRegex.test(text)) {
      return 'ar-SA';
    } else if (cyrillicRegex.test(text)) {
      return 'ru-RU';
    } else if (greekRegex.test(text)) {
      return 'el-GR';
    } else if (hebrewRegex.test(text)) {
      return 'he-IL';
    } else if (europeanRegex.test(text)) {
      // Có thể là Pháp, Đức, Tây Ban Nha... mặc định Pháp
      if (/[àâäáãåæçéèêëîïôöùûüÿ]/.test(text)) {
        return 'fr-FR';
      } else if (/[äöüß]/.test(text)) {
        return 'de-DE';
      } else if (/[ñ]/.test(text)) {
        return 'es-ES';
      } else {
        return 'fr-FR'; // Mặc định Pháp
      }
    } else {
      return 'en-US'; // Mặc định tiếng Anh
    }
  }

  /**
   * Chuyển đổi mã ngôn ngữ ISO sang format của Web Speech API
   */
  convertToSpeechLanguage(isoCode: string): string {
    const languageMap: { [key: string]: string } = {
      'en': 'en-US',
      'vi': 'vi-VN',
      'ja': 'ja-JP',
      'zh': 'zh-CN',
      'ko': 'ko-KR',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'es': 'es-ES',
      'it': 'it-IT',
      'pt': 'pt-BR',
      'ru': 'ru-RU',
      'ar': 'ar-SA',
      'th': 'th-TH'
    };

    return languageMap[isoCode] || 'en-US';
  }

  /**
   * Phát âm với ngôn ngữ từ deck (sử dụng deck language thay vì auto-detect)
   */
  speakTextWithDeckLanguage(text: string, deckLanguage?: string): Promise<void> {
    let language: string;

    if (deckLanguage) {
      // Sử dụng ngôn ngữ từ deck
      language = this.convertToSpeechLanguage(deckLanguage);
    } else {
      // Fallback về auto-detect nếu không có deck language
      language = this.detectLanguage(text);
    }

    console.log(`Speaking "${text}" with deck language: ${deckLanguage} -> ${language}`);
    return this.speakText(text, language);
  }
}