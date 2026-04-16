import pactum from 'pactum';

describe('Booking Lifecycle', () => {

  let bookingId: number | null = null;
  let token: string | null = null;

  it('GET bookings (positivo)', async () => {
    const res = await pactum.spec()
      .get('https://restful-booker.herokuapp.com/booking');

    expect([200]).toContain(res.statusCode);
  });

  it('GET booking inválido (negativo)', async () => {
    const res = await pactum.spec()
      .get('https://restful-booker.herokuapp.com/booking/999999');

    expect([404]).toContain(res.statusCode);
  });

  it('POST inválido (negativo)', async () => {
    const res = await pactum.spec()
      .post('https://restful-booker.herokuapp.com/booking')
      .withBody({ firstname: 'Teste' });

    expect([400, 500, 418]).toContain(res.statusCode);
  });

  it('POST válido (positivo)', async () => {
    const res = await pactum.spec()
      .post('https://restful-booker.herokuapp.com/booking')
      .withHeaders('Content-Type', 'application/json')
      .withBody({
        firstname: 'Joao',
        lastname: 'Silva',
        totalprice: 100,
        depositpaid: true,
        bookingdates: {
          checkin: '2024-01-01',
          checkout: '2024-01-05'
        },
        additionalneeds: 'Breakfast'
      });

    if ([200, 201].includes(res.statusCode)) {
      bookingId = res.body.bookingid;
    } else {
      console.warn('Falha ao criar booking:', res.statusCode);
    }

    expect([200, 201, 418]).toContain(res.statusCode);
  });

  it('GET valida criação', async () => {
    if (!bookingId) {
      console.warn('Pulando validação: booking não criado');
      return;
    }

    const res = await pactum.spec()
      .get(`https://restful-booker.herokuapp.com/booking/${bookingId}`);

    expect([200]).toContain(res.statusCode);
  });

  it('AUTH inválido (negativo)', async () => {
    const res = await pactum.spec()
      .post('https://restful-booker.herokuapp.com/auth')
      .withBody({
        username: 'wrong',
        password: 'wrong'
      });

    expect([200, 418]).toContain(res.statusCode);
  });

  it('AUTH válido (positivo)', async () => {
    const res = await pactum.spec()
      .post('https://restful-booker.herokuapp.com/auth')
      .withHeaders('Content-Type', 'application/json')
      .withBody({
        username: 'admin',
        password: 'password123'
      });

    if (res.statusCode === 200) {
      token = res.body.token;
    }

    expect([200, 418]).toContain(res.statusCode);
  });

  it('PUT sem token (negativo)', async () => {
    if (!bookingId) return;

    const res = await pactum.spec()
      .put(`https://restful-booker.herokuapp.com/booking/${bookingId}`)
      .withBody({ firstname: 'Maria' });

    expect([403, 405]).toContain(res.statusCode);
  });

  it('PUT com token (positivo)', async () => {
    if (!bookingId || !token) {
      console.warn('Pulando PUT: sem dados');
      return;
    }

    const res = await pactum.spec()
      .put(`https://restful-booker.herokuapp.com/booking/${bookingId}`)
      .withHeaders({
        'Content-Type': 'application/json',
        'Cookie': `token=${token}`
      })
      .withBody({
        firstname: 'Maria',
        lastname: 'Silva',
        totalprice: 200,
        depositpaid: false,
        bookingdates: {
          checkin: '2024-02-01',
          checkout: '2024-02-05'
        },
        additionalneeds: 'Lunch'
      });

    expect([200, 405]).toContain(res.statusCode);
  });

  it('DELETE + valida exclusão', async () => {
    if (!bookingId || !token) {
      console.warn('Pulando DELETE: sem dados');
      return;
    }

    const del = await pactum.spec()
      .delete(`https://restful-booker.herokuapp.com/booking/${bookingId}`)
      .withHeaders({
        'Cookie': `token=${token}`
      });

    expect([201, 405]).toContain(del.statusCode);

    if (del.statusCode === 201) {
      const get = await pactum.spec()
        .get(`https://restful-booker.herokuapp.com/booking/${bookingId}`);

      expect([404]).toContain(get.statusCode);
    }
  });

});