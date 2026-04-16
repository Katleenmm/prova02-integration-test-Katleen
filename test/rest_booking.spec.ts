import pactum from 'pactum';

describe('Booking Lifecycle', () => {

  let bookingId: number | null = null;
  let token: string | null = null;

  it('GET bookings (positivo)', async () => {
    const res = await pactum.spec()
      .get('https://restful-booker.herokuapp.com/booking');

    expect([200]).toContain(res.statusCode);
  });

  

});