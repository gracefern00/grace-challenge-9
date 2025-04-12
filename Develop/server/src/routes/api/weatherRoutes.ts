import { Router, Request, Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    // GET weather data from city name
    const weatherData = await WeatherService.getWeatherByCity(city);

    // Save city to search history
    await HistoryService.saveCity(city);

    res.status(200).json(weatherData);
  } catch (error: any) {
    console.error('Error fetching weather:', error.message);
    res.status(500).json({ error: 'Failed to retrieve weather data' });
  }
});

// GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const history = await HistoryService.getHistory();
    res.status(200).json(history);
  } catch (error: any) {
    console.error('Error fetching history:', error.message);
    res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

// BONUS: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await HistoryService.deleteCity(id);
    res.status(200).json({ message: `City with id ${id} deleted from history` });
  } catch (error: any) {
    console.error('Error deleting city from history:', error.message);
    res.status(500).json({ error: 'Failed to delete city from history' });
  }
});

export default router;
