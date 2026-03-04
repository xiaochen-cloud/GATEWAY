from database import init_db

if __name__ == "__main__":
    try:
        init_db()
        print("数据库初始化成功!")
    except Exception as e:
        print(f"数据库初始化失败: {e}")
        print("\n注意: 看起来PostgreSQL数据库服务没有启动。")
        print("系统会使用SQLite作为备用数据库继续运行。")
        print("生产环境请确保PostgreSQL服务正常运行。")