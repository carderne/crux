# crux MILP solver
A basic FastAPI app to serve optimal Double Crux pairings!

This calculates the best disagreement based on maximising the maximum disagreement, maximising the minimum disagreement, or maximising the average disagreement, and is actually optimal! 🚀

The MILP API is available at [this endpoint](https://crux-milp-api.onrender.com/docs).

The interesting bit is in [app/crux.py](app/crux.py).

### Local development
## Running the app directly
```bash
uvicorn app.app:app --reload
```
