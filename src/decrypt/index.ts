import { Decrypt as XmDecrypt } from '@/decrypt/xm';
import { Decrypt as KwmDecrypt } from '@/decrypt/kwm';
import { Decrypt as RawDecrypt } from '@/decrypt/raw';
import { Decrypt as TmDecrypt } from '@/decrypt/tm';
import { Decrypt as JooxDecrypt } from '@/decrypt/joox';
import { DecryptResult, FileInfo } from '@/decrypt/entity';
import { SplitFilename } from '@/decrypt/utils';
import { storage } from '@/utils/storage';
import InMemoryStorage from '@/utils/storage/InMemoryStorage';

export async function Decrypt(file: FileInfo, config: Record<string, any>): Promise<DecryptResult> {
  // Worker thread will fallback to in-memory storage.
  if (storage instanceof InMemoryStorage) {
    await storage.setAll(config);
  }

  const raw = SplitFilename(file.name);
  let rt_data: DecryptResult;
  switch (raw.ext) {
    case 'kwm': // Kuwo Mp3/Flac
      rt_data = await KwmDecrypt(file.raw, raw.name, raw.ext);
      break;
    case 'xm': // Xiami Wav/M4a/Mp3/Flac
    case 'wav': // Xiami/Raw Wav
    case 'mp3': // Xiami/Raw Mp3
    case 'flac': // Xiami/Raw Flac
    case 'm4a': // Xiami/Raw M4a
      rt_data = await XmDecrypt(file.raw, raw.name, raw.ext);
      break;
    case 'ogg': // Raw Ogg
      rt_data = await RawDecrypt(file.raw, raw.name, raw.ext);
      break;
    case 'ofl_en':
      rt_data = await JooxDecrypt(file.raw, raw.name, raw.ext);
      break;
    default:
      throw '不支持此文件格式';
  }

  if (!rt_data.rawExt) rt_data.rawExt = raw.ext;
  if (!rt_data.rawFilename) rt_data.rawFilename = raw.name;
  console.log(rt_data);
  return rt_data;
}
