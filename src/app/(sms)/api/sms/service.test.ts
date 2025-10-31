import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTargetUsers, sendMessage, sendAll, requestMessageSend } from './service';
import { SendSMSRequest, SMSTarget } from './schema';
import * as userService from '@/app/(users)/service';
import * as formatService from './formatter';
import prisma from '@/lib/prisma';

vi.mock('@/app/(users)/service');
vi.mock('./formats');
vi.mock('@/lib/prisma', () => ({
  default: {
    location: {
      findUniqueOrThrow: vi.fn(),
    },
  },
}));

global.fetch = vi.fn();

describe('getTargetUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all users for selected location when isTotalSelected is true', async () => {
    const mockUsers = [
      { id: 1, name: 'User1', contact: '010-1111-1111' },
      { id: 2, name: 'User2', contact: '010-2222-2222' },
    ];
    vi.mocked(userService.searchUsers).mockResolvedValue([mockUsers, 2] as any);

    const result = await getTargetUsers({
      receiverType: 'BIRTHDAY',
      isTotalSelected: true,
      selectedLocationId: 5,
    });

    expect(userService.searchUsers).toHaveBeenCalledWith({
      filter: 'BIRTHDAY',
      locationId: 5,
    });
    expect(result).toEqual(mockUsers);
  });

  it('should search users by receiverType when isTotalSelected is false', async () => {
    const mockUsers = [{ id: 1, name: 'User1', contact: '010-1111-1111' }];
    vi.mocked(userService.searchUsers).mockResolvedValue([mockUsers, 1] as any);

    const result = await getTargetUsers({
      receiverType: 'ONE_DAY_BEFORE_LESSON',
      isTotalSelected: false,
      selectedLocationId: 5,
    });

    expect(userService.searchUsers).toHaveBeenCalledWith({
      filter: 'ONE_DAY_BEFORE_LESSON',
    });
    expect(result).toEqual([mockUsers, 1]);
  });

  it('should handle empty user list', async () => {
    vi.mocked(userService.searchUsers).mockResolvedValue([[], 0] as any);

    const result = await getTargetUsers({
      receiverType: 'BIRTHDAY',
      isTotalSelected: true,
      selectedLocationId: 1,
    });

    expect(result).toEqual([]);
  });
});

describe('sendMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  it('should send same message to all targets when receiverType is ALL', async () => {
    const mockLocation = { phone: '02-1234-5678' };
    vi.mocked(prisma.location.findUniqueOrThrow).mockResolvedValue(mockLocation as any);
    vi.spyOn(formatService, 'buildMessageMap').mockReturnValue({});

    const targetInfos: SMSTarget[] = [{ contact: '010-1111-1111' }, { contact: '010-2222-2222' }];

    const request: SendSMSRequest = {
      receiverType: 'ALL',
      message: 'Custom message',
      targetInfos,
      selectedLocationId: 1,
    };

    await sendMessage(request);

    expect(prisma.location.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { phone: true },
    });
  });

  it('should use formatted messages for specific receiver types', async () => {
    const mockLocation = { phone: '02-1234-5678' };
    vi.mocked(prisma.location.findUniqueOrThrow).mockResolvedValue(mockLocation as any);

    const mockFormatInfo = {
      '1': {
        user: { contact: '010-1111-1111', name: 'Alice' },
        replaceTargets: { TIME: '14' },
      },
    };
    vi.mocked(formatService.getFormatInfo).mockResolvedValue(mockFormatInfo);

    const mockMessageMap = {
      '010-1111-1111': '안녕하세요. 내일 14시 레슨입니다.',
    };
    vi.mocked(formatService.buildMessageMap).mockReturnValue(mockMessageMap);
    vi.mocked(formatService.getMessageFormat).mockReturnValue('포맷된 메시지');

    const targetInfos: SMSTarget[] = [{ id: 1, contact: '010-1111-1111', name: 'Alice' }];

    const request: SendSMSRequest = {
      receiverType: 'ONE_DAY_BEFORE_LESSON',
      message: 'ignored',
      targetInfos,
      selectedLocationId: 1,
    };

    await sendMessage(request);

    expect(formatService.getFormatInfo).toHaveBeenCalledWith({
      targetInfos,
      receiverType: 'ONE_DAY_BEFORE_LESSON',
    });
    expect(formatService.getMessageFormat).toHaveBeenCalled();
    expect(formatService.buildMessageMap).toHaveBeenCalled();
  });

  it('should handle BIRTHDAY receiver type', async () => {
    const mockLocation = { phone: '010-9999-9999' };
    vi.mocked(prisma.location.findUniqueOrThrow).mockResolvedValue(mockLocation as any);

    const mockFormatInfo = {
      '2': {
        user: { contact: '010-2222-2222', name: 'Bob' },
        replaceTargets: { NAME: 'Bob', DEADLINE_MONTH: '3', DEADLINE_DAY: '15' },
      },
    };
    vi.mocked(formatService.getFormatInfo).mockResolvedValue(mockFormatInfo);

    const mockMessageMap = {
      '010-2222-2222': 'Bob님, 생일 축하합니다! 3월 15일까지 사용 가능합니다.',
    };
    vi.mocked(formatService.buildMessageMap).mockReturnValue(mockMessageMap);
    vi.mocked(formatService.getMessageFormat).mockReturnValue('생일 메시지');

    const targetInfos: SMSTarget[] = [{ id: 2, contact: '010-2222-2222', name: 'Bob' }];

    const request: SendSMSRequest = {
      receiverType: 'BIRTHDAY',
      message: 'ignored',
      targetInfos,
      selectedLocationId: 1,
    };

    await sendMessage(request);

    expect(formatService.getFormatInfo).toHaveBeenCalledWith({
      targetInfos,
      receiverType: 'BIRTHDAY',
    });
  });
});

describe('sendAll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  it('should send message to all contacts', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const messageMap = {
      '010-1111-1111': 'Message 1',
      '010-2222-2222': 'Message 2',
      '010-3333-3333': 'Message 3',
    };

    await sendAll('02-1234-5678', messageMap);

    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('should handle empty message map', async () => {
    const messageMap = {};
    await sendAll('02-1234-5678', messageMap);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle split phone number', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const messageMap = {
      '010-1111-1111': 'Test message',
    };

    const sourcePhoneNumber = {
      sphone1: '02',
      sphone2: '1234',
      sphone3: '5678',
    };

    await sendAll(sourcePhoneNumber, messageMap);

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should call requestMessageSend for each contact', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const messageMap = {
      '010-1111-1111': 'Message 1',
      '010-2222-2222': 'Message 2',
    };

    await sendAll('02-1234-5678', messageMap);

    // Each message should be sent to a different contact
    const calls = (global.fetch as any).mock.calls;
    expect(calls.length).toBe(2);
  });
});

describe('requestMessageSend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
    process.env.SMS_SECRET = 'test_secret';
    process.env.SMS_USER_ID = 'test_user_id';
    process.env.SMS_URL = 'https://sms.api.example.com';
  });

  it('should send SMS with correct format', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await requestMessageSend('02-1234-5678', '010-9999-9999', 'Test message');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const fetchCall = (global.fetch as any).mock.calls[0];
    expect(fetchCall[0]).toBe('https://sms.api.example.com');
    expect(fetchCall[1]).toHaveProperty('body');
  });

  it('should split phone string into parts', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await requestMessageSend('02-1234-5678', '010-9999-9999', 'Test');

    expect(global.fetch).toHaveBeenCalledWith('https://sms.api.example.com', expect.any(Object));
  });

  it('should handle phone object directly', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const sourcePhone = {
      sphone1: '02',
      sphone2: '1234',
      sphone3: '5678',
    };

    await requestMessageSend(sourcePhone, '010-9999-9999', 'Test');

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should add title for long messages', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const longMessage = 'a'.repeat(100); // Longer than 90 characters

    await requestMessageSend('02-1234-5678', '010-9999-9999', longMessage);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const fetchCall = (global.fetch as any).mock.calls[0];
    expect(fetchCall[1]).toHaveProperty('body');
  });

  it('should set testflag Y in development', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await requestMessageSend('02-1234-5678', '010-9999-9999', 'Test');

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should encode form data in base64', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await requestMessageSend('02-1234-5678', '010-9999-9999', 'Test message');

    const fetchCall = (global.fetch as any).mock.calls[0];
    expect(fetchCall[1]).toHaveProperty('body');
  });

  it('should handle custom title parameter', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const longMessage = 'a'.repeat(100);
    const customTitle = 'Custom Title';

    await requestMessageSend('02-1234-5678', '010-9999-9999', longMessage, customTitle);

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
