This is a small visualization for an open early voting dataset.

The following columns are expected:

* REGISTERED
  * a date
* LASTNAME
* FIRSTNAME
* STATUS
  * A = active
  * X = means they need to show ID under certain conditions 
  * F = individual is eligible to vote in federal election
* PARTY
* RES_HOUSE
* RES_APT
* RES_STREET
* RES_CITY
* RES_STATE
* RES_ZIP
* RES_ZIP4
* PRECINCT (1-143)
* WARD (1-8)
* ANC
* SMD
* Election dates: (MMDDYY, P= primary, S= special, G= general)
042815-S,110414-G,071514-S,040114-P,042313-S,112012-G,052012-S,042012-P,022012-S,042011-S,112010-G,092010-P,112008-G,092008-P,022008-P,082007-S,052007-S,112006-G,092006-P,112004-G,092004-P,042004-S,012004-P,112002-G,092002-P,112000-G,092000-P,082000-P,012000-S,111999-G,111998-G,091998-P,081998-P,111997-G,091997-P,011997-S,111996-G,091996-P,081996-P,111995-G,091995-P,011995-S,111994-G
* Values in the election fields
  * E = eligible, but did not vote
  * Y = early voter
  * N = inactive voter or "not eligible" based on policies used by the election
board to ensure address/identity, etc is correct; may also be voters that are
not eligible to vote because a special election in not being held in their
precinct
   * Ward 4 & 8 had a special election 4/28/2015.  Voters not in these wards are
marked N because they did not have an election to vote in.
  * A = absentee (domestic or overseas) voter
  * V= Voted at polls on Election Day

