import sys
sys.path.insert(0, '.')

from database import init_db

try:
    init_db()
    print("数据库初始化成功!")
except Exception as e:
    print(f"数据库初始化失败: {e}")