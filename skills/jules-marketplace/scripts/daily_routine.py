import logging
from post_blog import post_blog
from create_video import create_video
from check_agents import check_agents

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def daily_routine():
    """Executes the daily marketplace routine for Jules."""
    logger.info("Starting Jules' daily marketplace routine...")

    try:
        post_blog()
        create_video()
        check_agents()
        logger.info("Daily routine completed successfully.")
    except Exception as e:
        logger.error(f"Error during daily routine: {e}")

if __name__ == "__main__":
    daily_routine()
