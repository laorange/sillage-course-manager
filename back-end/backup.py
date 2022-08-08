import os
import zipfile
from datetime import datetime
from pathlib import Path
from bypy import ByPy


def getZipDir(dirPath: Path, outFullName: Path):
    """
    压缩指定文件夹
    :param dirPath: 目标文件夹路径
    :param outFullName: 压缩文件保存路径+xxxx.zip
    :return: 无
    """
    dirPath = str(dirPath)
    outFullName = str(outFullName)

    zipObj = zipfile.ZipFile(outFullName, "w", zipfile.ZIP_DEFLATED)
    for path, dirNames, filenames in os.walk(dirPath):
        # 去掉目标&路径，只对目标文件夹下边的文件及文件夹进行压缩
        print(path, dirNames, filenames)

        fpath = path.replace(dirPath, '')

        for filename in filenames:
            zipObj.write(os.path.join(path, filename), os.path.join(fpath, filename))


if __name__ == '__main__':
    PB_ROOT: Path = Path(__file__).parent.resolve()

    DATA_DIR: Path = PB_ROOT / "pb_data"
    BK_DIR: Path = PB_ROOT / "bk"

    backup_file = BK_DIR / f"pb_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"

    if not BK_DIR.exists():
        os.mkdir(BK_DIR)

    getZipDir(DATA_DIR, backup_file)

    bp = ByPy()
    bp.upload(str(BK_DIR), "PocketBaseBackUp")

    os.remove(backup_file)
