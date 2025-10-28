import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMessageFormat, buildMessageMap, getFormatInfo, SMSFormats } from './formats';
import { SMSTarget } from './schema';
import * as dateUtils from '@/utils/date';
import * as lessonService from '@/app/(lessons)/service';
import * as paymentService from '@/app/(payments)/service';

vi.mock('@/utils/date');
vi.mock('@/app/(lessons)/service');
vi.mock('@/app/(payments)/service');

describe('getMessageFormat', () => {
  it('should return custom message when receiverType is "ALL"', () => {
    const customMessage = 'Custom SMS message';
    const result = getMessageFormat({
      receiverType: 'ALL',
      message: customMessage,
    });
    expect(result).toBe(customMessage);
  });

  it('should return predefined format for ONE_DAY_BEFORE_LESSON', () => {
    const result = getMessageFormat({
      receiverType: 'ONE_DAY_BEFORE_LESSON',
      message: 'ignored',
    });
    expect(result).toBe(SMSFormats.ONE_DAY_BEFORE_LESSON);
  });

  it('should return predefined format for ONE_WEEK_BEFORE_REREGISTER', () => {
    const result = getMessageFormat({
      receiverType: 'ONE_WEEK_BEFORE_REREGISTER',
      message: 'ignored',
    });
    expect(result).toBe(SMSFormats.ONE_WEEK_BEFORE_REREGISTER);
  });

  it('should return predefined format for BIRTHDAY', () => {
    const result = getMessageFormat({
      receiverType: 'BIRTHDAY',
      message: 'ignored',
    });
    expect(result).toBe(SMSFormats.BIRTHDAY);
  });
});

describe('buildMessageMap', () => {
  it('should build message map with single replacement', () => {
    const messageFormat = 'Hello %NAME%';
    const formatInfo = {
      '0': {
        user: { contact: '010-1234-5678', name: 'John' },
        replaceTargets: { NAME: 'John' },
      },
    };

    const result = buildMessageMap({ messageFormat, formatInfo });

    expect(result).toEqual({
      '010-1234-5678': 'Hello John',
    });
  });

  it('should build message map with multiple replacements', () => {
    const messageFormat = '%NAME%님, 내일 %TIME%시 레슨입니다.';
    const formatInfo = {
      '0': {
        user: { contact: '010-1234-5678', name: 'Alice' },
        replaceTargets: { NAME: 'Alice', TIME: '14' },
      },
      '1': {
        user: { contact: '010-8765-4321', name: 'Bob' },
        replaceTargets: { NAME: 'Bob', TIME: '18' },
      },
    };

    const result = buildMessageMap({ messageFormat, formatInfo });

    expect(result).toEqual({
      '010-1234-5678': 'Alice님, 내일 14시 레슨입니다.',
      '010-8765-4321': 'Bob님, 내일 18시 레슨입니다.',
    });
  });

  it('should handle multiple occurrences of same replacement', () => {
    const messageFormat = '%NAME%님 %NAME%님 환영합니다';
    const formatInfo = {
      '0': {
        user: { contact: '010-1234-5678' },
        replaceTargets: { NAME: 'Charlie' },
      },
    };

    const result = buildMessageMap({ messageFormat, formatInfo });

    expect(result['010-1234-5678']).toBe('Charlie님 Charlie님 환영합니다');
  });

  it('should handle empty format info', () => {
    const messageFormat = 'Hello %NAME%';
    const formatInfo = {};

    const result = buildMessageMap({ messageFormat, formatInfo });

    expect(result).toEqual({});
  });

  it('should not replace unreplaced tokens', () => {
    const messageFormat = 'Hello %NAME%, your code is %CODE%';
    const formatInfo = {
      '0': {
        user: { contact: '010-1234-5678' },
        replaceTargets: { NAME: 'David' },
      },
    };

    const result = buildMessageMap({ messageFormat, formatInfo });

    expect(result['010-1234-5678']).toBe('Hello David, your code is %CODE%');
  });

  it('should use contact field as key', () => {
    const messageFormat = 'Test message';
    const formatInfo = {
      '0': {
        user: { contact: '02-123-4567' },
        replaceTargets: {},
      },
      '1': {
        user: { contact: '031-456-7890' },
        replaceTargets: {},
      },
    };

    const result = buildMessageMap({ messageFormat, formatInfo });

    expect(Object.keys(result)).toContain('02-123-4567');
    expect(Object.keys(result)).toContain('031-456-7890');
  });
});

describe('getFormatInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ONE_DAY_BEFORE_LESSON', () => {
    it('should fetch tomorrow lesson and return TIME replacement', async () => {
      const mockLesson = { dueHour: 14 };
      vi.mocked(lessonService.getTomorowLesson).mockResolvedValue(mockLesson as any);

      const targetInfos: SMSTarget[] = [{ id: 1, name: 'Alice', contact: '010-1111-1111' }];

      const result = await getFormatInfo({
        targetInfos,
        receiverType: 'ONE_DAY_BEFORE_LESSON',
      });

      // targetInfos는 배열이므로 Object.entries()에서 인덱스 '0'이 userId 키
      expect(lessonService.getTomorowLesson).toHaveBeenCalledWith(1);
      expect(result['0']).toEqual({
        user: targetInfos[0],
        replaceTargets: { TIME: '14' },
      });
    });

    it('should handle multiple users with array indices as keys', async () => {
      const mockLesson = { dueHour: 10 };
      vi.mocked(lessonService.getTomorowLesson).mockResolvedValue(mockLesson as any);

      const targetInfos: SMSTarget[] = [
        { id: 1, contact: '010-1111-1111' },
        { id: 2, contact: '010-2222-2222' },
      ];

      const result = await getFormatInfo({
        targetInfos,
        receiverType: 'ONE_DAY_BEFORE_LESSON',
      });

      expect(Object.keys(result)).toHaveLength(2);
      expect(result['0'].replaceTargets.TIME).toBe('10');
      expect(result['1'].replaceTargets.TIME).toBe('10');
      expect(lessonService.getTomorowLesson).toHaveBeenCalledTimes(2);
      expect(lessonService.getTomorowLesson).toHaveBeenNthCalledWith(1, 1);
      expect(lessonService.getTomorowLesson).toHaveBeenNthCalledWith(2, 2);
    });
  });

  describe('BIRTHDAY', () => {
    it('should return NAME and DEADLINE replacements', async () => {
      const mockDeadline = new Date(2025, 1, 15);
      vi.mocked(dateUtils.getBirthdayCouponDeadline).mockReturnValue(mockDeadline);

      const targetInfos: SMSTarget[] = [{ id: 1, name: 'Bob', contact: '010-3333-3333' }];

      const result = await getFormatInfo({
        targetInfos,
        receiverType: 'BIRTHDAY',
      });

      expect(result['0']).toEqual({
        user: targetInfos[0],
        replaceTargets: {
          NAME: 'Bob',
          DEADLINE_MONTH: '2',
          DEADLINE_DAY: '15',
        },
      });
    });

    it('should handle December birthday deadline correctly', async () => {
      const mockDeadline = new Date(2025, 11, 31);
      vi.mocked(dateUtils.getBirthdayCouponDeadline).mockReturnValue(mockDeadline);

      const targetInfos: SMSTarget[] = [{ id: 1, name: 'Carol', contact: '010-4444-4444' }];

      const result = await getFormatInfo({
        targetInfos,
        receiverType: 'BIRTHDAY',
      });

      expect(result['0'].replaceTargets.DEADLINE_MONTH).toBe('12');
      expect(result['0'].replaceTargets.DEADLINE_DAY).toBe('31');
    });
  });

  describe('ONE_WEEK_BEFORE_REREGISTER', () => {
    it('should fetch payment and return registration period info', async () => {
      const mockPayment = {
        startDate: new Date(2025, 0, 1),
        endDate: new Date(2025, 2, 31),
      };
      vi.mocked(paymentService.getLatestUserPayment).mockResolvedValue(mockPayment as any);

      const mockPeriod = {
        startDate: new Date(2025, 2, 31),
        endDate: new Date(2025, 3, 30),
      };
      vi.mocked(dateUtils.getCurrentDatePeriod).mockReturnValue(mockPeriod);
      vi.mocked(dateUtils.formatDate).mockImplementation(
        (date: Date) => date.toISOString().split('T')[0],
      );

      const targetInfos: SMSTarget[] = [{ id: 5, name: 'David', contact: '010-5555-5555' }];

      const result = await getFormatInfo({
        targetInfos,
        receiverType: 'ONE_WEEK_BEFORE_REREGISTER',
      });

      // 배열의 첫 번째 요소이므로 인덱스 '0'이 키
      expect(paymentService.getLatestUserPayment).toHaveBeenCalledWith(5);
      expect(dateUtils.getCurrentDatePeriod).toHaveBeenCalled();
      expect(result['0']).toEqual({
        user: targetInfos[0],
        replaceTargets: {
          NAME: 'David',
          REREGISTER_START: expect.any(String),
          REREGISTER_END: expect.any(String),
          STARTDATE: expect.any(String),
        },
      });
    });

    it('should not include user when payment is missing', async () => {
      vi.mocked(paymentService.getLatestUserPayment).mockResolvedValue(null);

      const targetInfos: SMSTarget[] = [{ id: 6, name: 'Eve', contact: '010-6666-6666' }];

      const result = await getFormatInfo({
        targetInfos,
        receiverType: 'ONE_WEEK_BEFORE_REREGISTER',
      });

      expect(result).toEqual({});
    });

    it('should not include user when payment dates are missing', async () => {
      const mockPayment = { startDate: null, endDate: null };
      vi.mocked(paymentService.getLatestUserPayment).mockResolvedValue(mockPayment as any);

      const targetInfos: SMSTarget[] = [{ id: 7, name: 'Frank', contact: '010-7777-7777' }];

      const result = await getFormatInfo({
        targetInfos,
        receiverType: 'ONE_WEEK_BEFORE_REREGISTER',
      });

      expect(result).toEqual({});
    });

    it('should skip user with missing dates but include others', async () => {
      const mockPaymentInvalid = { startDate: null, endDate: null };
      const mockPaymentValid = {
        startDate: new Date(2025, 0, 1),
        endDate: new Date(2025, 2, 31),
      };

      vi.mocked(paymentService.getLatestUserPayment)
        .mockResolvedValueOnce(mockPaymentInvalid as any)
        .mockResolvedValueOnce(mockPaymentValid as any);

      const mockPeriod = {
        startDate: new Date(2025, 2, 31),
        endDate: new Date(2025, 3, 30),
      };
      vi.mocked(dateUtils.getCurrentDatePeriod).mockReturnValue(mockPeriod);
      vi.mocked(dateUtils.formatDate).mockImplementation(
        (date: Date) => date.toISOString().split('T')[0],
      );

      const targetInfos: SMSTarget[] = [
        { id: 7, name: 'Frank', contact: '010-7777-7777' },
        { id: 8, name: 'Grace', contact: '010-8888-8888' },
      ];

      const result = await getFormatInfo({
        targetInfos,
        receiverType: 'ONE_WEEK_BEFORE_REREGISTER',
      });

      // 첫 번째 사용자는 스킵되고 두 번째 사용자만 포함 (인덱스 '1')
      expect(Object.keys(result)).toEqual(['1']);
      expect(result['1'].user.name).toBe('Grace');
    });
  });

  describe('Edge cases', () => {
    it('should return empty object for unknown receiver type', async () => {
      const targetInfos: SMSTarget[] = [{ id: 1, contact: '010-1111-1111' }];

      const result = await getFormatInfo({
        targetInfos,
        receiverType: 'ALL' as any,
      });

      expect(result).toEqual({});
    });

    it('should handle empty target infos', async () => {
      const result = await getFormatInfo({
        targetInfos: [],
        receiverType: 'BIRTHDAY',
      });

      expect(result).toEqual({});
    });
  });
});
